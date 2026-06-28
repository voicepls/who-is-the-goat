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
  source: "thesportsdb" | "mock";
  games: ScoreGame[];
};

const DAYS_LOOKBACK = 4;
const MAX_FINISHED = 4;
const MAX_UPCOMING = 2;
const MAX_GAMES = 6;

export const MOCK_GAMES: ScoreGame[] = [
  { id: "mock-1", home: "Argentina", away: "Japan", homeScore: 2, awayScore: 0, status: "FT", league: "FIFA World Cup 2026", kickoff: null },
  { id: "mock-2", home: "New Zealand", away: "Belgium", homeScore: 1, awayScore: 5, status: "FT", league: "FIFA World Cup 2026", kickoff: null },
  { id: "mock-3", home: "Algeria", away: "Austria", homeScore: null, awayScore: null, status: "Upcoming", league: "FIFA World Cup 2026", kickoff: null },
];

type SportsDbEvent = {
  idEvent?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  intHomeScore?: string | number | null;
  intAwayScore?: string | number | null;
  strStatus?: string;
  strProgress?: string;
  strLeague?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
};

function normalizeStatus(rawStatus: unknown): ScoreStatus {
  const status = String(rawStatus ?? "").toLowerCase();
  if (["inprogress", "in progress", "live", "1h", "2h", "ht", "halftime", "et"].some((s) => status.includes(s))) {
    return "LIVE";
  }
  if (["final", "full time", "ft", "match finished", "aet", "complete"].some((s) => status.includes(s))) {
    return "FT";
  }
  return "Upcoming";
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function toKickoff(event: SportsDbEvent): string | null {
  if (event.strTimestamp) return event.strTimestamp;
  if (event.dateEvent && event.strTime) return `${event.dateEvent}T${event.strTime}Z`;
  if (event.dateEvent) return event.dateEvent;
  return null;
}

function leagueRank(league: string): number {
  return /world cup/i.test(league) ? 0 : 1;
}

function hasScore(game: ScoreGame): boolean {
  return game.homeScore !== null && game.awayScore !== null;
}

function toGame(event: SportsDbEvent, index: number): ScoreGame {
  const status = normalizeStatus(event.strStatus ?? event.strProgress);
  const homeScore = toNumber(event.intHomeScore);
  const awayScore = toNumber(event.intAwayScore);
  return {
    id: String(event.idEvent ?? `sdb-${index}`),
    home: event.strHomeTeam?.trim() || "Home",
    away: event.strAwayTeam?.trim() || "Away",
    homeScore,
    awayScore,
    status: status === "Upcoming" && homeScore !== null && awayScore !== null ? "FT" : status,
    league: event.strLeague?.trim() || "Soccer",
    kickoff: toKickoff(event),
  };
}

function ymdOffset(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function kickoffTime(game: ScoreGame): number {
  return game.kickoff ? Date.parse(game.kickoff) : 0;
}

function byLeagueThen(timeCompare: (a: ScoreGame, b: ScoreGame) => number) {
  return (a: ScoreGame, b: ScoreGame) => {
    const byLeague = leagueRank(a.league) - leagueRank(b.league);
    return byLeague !== 0 ? byLeague : timeCompare(a, b);
  };
}

async function fetchDay(date: string): Promise<SportsDbEvent[]> {
  const key = process.env.THESPORTSDB_KEY || "3";
  const url = `https://www.thesportsdb.com/api/v1/json/${key}/eventsday.php?d=${date}&s=Soccer`;
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) return [];
  const payload = (await response.json()) as { events?: SportsDbEvent[] | null };
  return Array.isArray(payload.events) ? payload.events : [];
}

function selectGames(games: ScoreGame[]): ScoreGame[] {
  const live = games.filter((g) => g.status === "LIVE").sort(byLeagueThen((a, b) => kickoffTime(a) - kickoffTime(b)));
  const finished = games
    .filter((g) => g.status === "FT" && hasScore(g))
    .sort(byLeagueThen((a, b) => kickoffTime(b) - kickoffTime(a)));
  const upcoming = games
    .filter((g) => g.status === "Upcoming")
    .sort(byLeagueThen((a, b) => kickoffTime(a) - kickoffTime(b)));

  return [...live, ...finished.slice(0, MAX_FINISHED), ...upcoming.slice(0, MAX_UPCOMING)].slice(0, MAX_GAMES);
}

export async function getScores(): Promise<ScoresResult> {
  try {
    const days = Array.from({ length: DAYS_LOOKBACK }, (_, i) => ymdOffset(i));
    const batches = await Promise.all(days.map((day) => fetchDay(day)));
    const events = batches.flat();
    if (events.length === 0) {
      return { source: "mock", games: MOCK_GAMES };
    }

    const seen = new Set<string>();
    const games: ScoreGame[] = [];
    for (const event of events) {
      const game = toGame(event, games.length);
      if (seen.has(game.id)) continue;
      seen.add(game.id);
      games.push(game);
    }

    const selected = selectGames(games);
    return { source: "thesportsdb", games: selected.length > 0 ? selected : MOCK_GAMES };
  } catch (error) {
    console.error("getScores: TheSportsDB fetch failed", error);
    return { source: "mock", games: MOCK_GAMES };
  }
}
