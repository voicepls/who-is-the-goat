import { ensureSchema, sql } from "@/lib/db";

export type ScoreStatus = "LIVE" | "FT" | "Upcoming";

export type ScoreGame = {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: ScoreStatus;
  league: string;
  kickoff: string | null;
};

export type ScoresResult = {
  source: "sportsdata" | "thesportsdb" | "footballdata" | "mock";
  date: string;
  games: ScoreGame[];
};

const MAX_FINISHED = 4;
const MAX_UPCOMING = 2;
const MAX_GAMES = 6;

export const MOCK_GAMES: ScoreGame[] = [
  { id: "mock-1", home: "Argentina", away: "Japan", homeScore: 2, awayScore: 0, status: "FT", league: "FIFA World Cup 2026", kickoff: null },
  { id: "mock-2", home: "New Zealand", away: "Belgium", homeScore: 1, awayScore: 5, status: "FT", league: "FIFA World Cup 2026", kickoff: null },
  { id: "mock-3", home: "Algeria", away: "Austria", homeScore: null, awayScore: null, status: "Upcoming", league: "FIFA World Cup 2026", kickoff: null },
];

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  competition?: { name: string };
  homeTeam: { name: string; shortName?: string };
  awayTeam: { name: string; shortName?: string };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};


function normalizeFDStatus(status: string): ScoreStatus {
  const s = status.toUpperCase();
  if (s === "IN_PLAY" || s === "PAUSED") return "LIVE";
  if (s === "FINISHED") return "FT";
  return "Upcoming";
}

function toFDGame(m: FootballDataMatch): ScoreGame {
  return {
    id: `fd-${m.id}`,
    home: m.homeTeam.shortName || m.homeTeam.name || "Home",
    away: m.awayTeam.shortName || m.awayTeam.name || "Away",
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    status: normalizeFDStatus(m.status),
    league: m.competition?.name || "Soccer",
    kickoff: m.utcDate,
  };
}

function ymdOffset(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function todayYmd(): string {
  return ymdOffset(0);
}

function kickoffTime(game: ScoreGame): number {
  return game.kickoff ? Date.parse(game.kickoff) : 0;
}

function leagueRank(league: string): number {
  return /world cup/i.test(league) ? 0 : 1;
}

function hasScore(game: ScoreGame): boolean {
  return game.homeScore !== null && game.awayScore !== null;
}

function byLeagueThen(timeCompare: (a: ScoreGame, b: ScoreGame) => number) {
  return (a: ScoreGame, b: ScoreGame) => {
    const byLeague = leagueRank(a.league) - leagueRank(b.league);
    return byLeague !== 0 ? byLeague : timeCompare(a, b);
  };
}

function selectGames(games: ScoreGame[]): ScoreGame[] {
  const live = games.filter((g) => g.status === "LIVE").sort(byLeagueThen((a, b) => kickoffTime(a) - kickoffTime(b)));
  const upcoming = games
    .filter((g) => g.status === "Upcoming")
    .sort(byLeagueThen((a, b) => kickoffTime(a) - kickoffTime(b)));
  const finished = games
    .filter((g) => g.status === "FT" && hasScore(g))
    .sort(byLeagueThen((a, b) => kickoffTime(b) - kickoffTime(a)));

  return [...live, ...finished.slice(0, MAX_FINISHED), ...upcoming.slice(0, MAX_UPCOMING)].slice(0, MAX_GAMES);
}

function getTomorrow(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

let throttleUntil = 0;

async function fetchFootballDataDay(date: string): Promise<ScoreGame[] | null> {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) {
    return [];
  }

  if (Date.now() < throttleUntil) {
    console.warn(`[football-data.org] Fetch skipped. Rate limit throttle is active until ${new Date(throttleUntil).toISOString()}`);
    return null;
  }

  try {
    const tomorrow = getTomorrow(date);
    const url = `https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${tomorrow}`;
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": token,
      },
      next: { revalidate: 300 }, // Next.js level fetch caching (5 minutes)
      signal: AbortSignal.timeout(5000),
    });

    // Inspect rate-limiting headers
    const remainingHeader = response.headers.get("x-requests-available-minute");
    if (remainingHeader) {
      const remaining = parseInt(remainingHeader, 10);
      console.log(`[football-data.org] X-Requests-Available-Minute: ${remaining}`);
      if (remaining <= 1) {
        // Safe limit: throttle queries for 60 seconds
        throttleUntil = Date.now() + 60 * 1000;
        console.warn(`[football-data.org] Approaching rate limit boundary. Throttling requests until ${new Date(throttleUntil).toISOString()}`);
      }
    }

    if (response.status === 429) {
      console.error("[football-data.org] Rate limit exceeded (HTTP 429).");
      const retryAfter = response.headers.get("retry-after");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60 * 1000;
      throttleUntil = Date.now() + waitTime;
      return null;
    }

    if (!response.ok) {
      console.error(`football-data.org response failed: ${response.status}`);
      return [];
    }

    const data = await response.json() as { matches?: FootballDataMatch[] };
    if (!data.matches || !Array.isArray(data.matches)) return [];
    
    // Filter matches to only include ones starting with target date
    const filteredMatches = data.matches.filter((m) => m.utcDate.startsWith(date));
    return filteredMatches.map(toFDGame);
  } catch (error) {
    console.error("fetchFootballDataDay failed", error);
    return [];
  }
}

// Global variable memory cache for local-only demo mode
const globalMemoryCache: Record<string, { payload: ScoreGame[]; updatedAt: number }> = {};

export async function getScores(requestedDate = todayYmd()): Promise<ScoresResult> {
  const date = isYmd(requestedDate) ? requestedDate : todayYmd();
  const cacheKey = `scores_${date}`;
  const isThrottled = Date.now() < throttleUntil;

  let cachedPayload: ScoreGame[] | null = null;
  let cacheAgeMs = Infinity;

  // 1. Try to read from Neon DB cache
  if (sql) {
    try {
      await ensureSchema();
      const cached = await sql`
        select payload, updated_at from scores_cache where cache_key = ${cacheKey}
      ` as { payload: string; updated_at: string }[];
      
      if (cached.length > 0) {
        const row = cached[0];
        cachedPayload = JSON.parse(row.payload) as ScoreGame[];
        cacheAgeMs = Date.now() - new Date(row.updated_at).getTime();
      }
    } catch (e) {
      console.error("Failed to read scores from DB cache", e);
    }
  } else {
    // 2. Try to read from local memory cache (during local demo runs)
    const memCached = globalMemoryCache[cacheKey];
    if (memCached) {
      cachedPayload = memCached.payload;
      cacheAgeMs = Date.now() - memCached.updatedAt;
    }
  }

  // A. Cache is fresh: return it immediately
  if (cachedPayload && cacheAgeMs < 5 * 60 * 1000) {
    return {
      source: "footballdata",
      date,
      games: cachedPayload,
    };
  }

  // B. Rate limit throttle is active: skip fetch and serve expired cache if available
  if (isThrottled) {
    if (cachedPayload) {
      return {
        source: "footballdata",
        date,
        games: cachedPayload,
      };
    } else {
      return {
        source: "mock",
        date,
        games: MOCK_GAMES,
      };
    }
  }

  // C. Cache is stale/empty & not throttled: fetch from API
  let games: ScoreGame[] = [];
  let source: ScoresResult["source"] = "footballdata";

  try {
    const liveGames = await fetchFootballDataDay(date);
    if (liveGames === null) {
      // API signaled rate limiting or throttle during request
      if (cachedPayload) {
        return {
          source: "footballdata",
          date,
          games: cachedPayload,
        };
      } else {
        games = MOCK_GAMES;
        source = "mock";
      }
    } else if (liveGames.length > 0) {
      games = selectGames(liveGames);
    } else {
      games = MOCK_GAMES;
      source = "mock";
    }
  } catch (err) {
    console.error("Live scores fetch failed, falling back to cached or mock", err);
    if (cachedPayload) {
      return {
        source: "footballdata",
        date,
        games: cachedPayload,
      };
    } else {
      games = MOCK_GAMES;
      source = "mock";
    }
  }

  // 3. Save new payload to database cache or memory cache
  if (source !== "mock" && games.length > 0) {
    if (sql) {
      try {
        await sql`
          insert into scores_cache (cache_key, payload, updated_at)
          values (${cacheKey}, ${JSON.stringify(games)}, now())
          on conflict (cache_key) do update 
          set payload = excluded.payload, updated_at = now()
        `;
      } catch (e) {
        console.error("Failed to write scores to DB cache", e);
      }
    } else {
      globalMemoryCache[cacheKey] = {
        payload: games,
        updatedAt: Date.now(),
      };
    }
  }

  return {
    source,
    date,
    games: games.length > 0 ? games : (cachedPayload || MOCK_GAMES),
  };
}
