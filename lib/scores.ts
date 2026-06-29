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
  source: "sportsdata" | "thesportsdb" | "mock";
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

type UnknownRecord = Record<string, unknown>;

function normalizeStatus(rawStatus: unknown): ScoreStatus {
  const status = String(rawStatus ?? "").toLowerCase();
  if (
    ["inprogress", "in progress", "progress", "live", "1h", "2h", "ht", "halftime", "et"].some((s) =>
      status.includes(s),
    )
  ) {
    return "LIVE";
  }
  if (
    ["final", "full time", "ft", "match finished", "aet", "complete", "closed"].some((s) =>
      status.includes(s),
    )
  ) {
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

function valueFrom(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
}

function stringFrom(record: UnknownRecord, keys: string[]): string {
  const value = valueFrom(record, keys);
  return value === null ? "" : String(value).trim();
}

function numberFrom(record: UnknownRecord, keys: string[]): number | null {
  return toNumber(valueFrom(record, keys));
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

function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function todayYmd(): string {
  return ymdOffset(0);
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

function toSportsDataGame(game: UnknownRecord, index: number): ScoreGame {
  const homeScore = numberFrom(game, ["HomeTeamScore", "HomeScore", "HomeTeamGoals", "ScoreHome"]);
  const awayScore = numberFrom(game, ["AwayTeamScore", "AwayScore", "AwayTeamGoals", "ScoreAway"]);
  const isClosed = valueFrom(game, ["IsClosed"]) === true;
  const status = normalizeStatus(
    valueFrom(game, ["Status", "GameStatus", "GameStatusName", "StatusName"]) ?? (isClosed ? "Final" : null),
  );

  return {
    id: stringFrom(game, ["GameId", "GlobalGameId", "FixtureId", "Id"]) || `sportsdata-${index}`,
    home: stringFrom(game, ["HomeTeamName", "HomeTeam", "HomeTeamKey", "Home"]) || "Home",
    away: stringFrom(game, ["AwayTeamName", "AwayTeam", "AwayTeamKey", "Away"]) || "Away",
    homeScore,
    awayScore,
    status: status === "Upcoming" && (isClosed || (homeScore !== null && awayScore !== null)) ? "FT" : status,
    league: stringFrom(game, ["CompetitionName", "Competition", "LeagueName", "League"]) || "FIFA World Cup 2026",
    kickoff: stringFrom(game, ["DateTime", "DateTimeUtc", "DateTimeUTC", "Day"]) || null,
  };
}

async function fetchSportsDataDay(date: string): Promise<ScoreGame[]> {
  const key =
    process.env.SPORTSDATA_API_KEY ||
    process.env.SPORTS_DATA_API_KEY ||
    process.env.SPORTSDATAIO_KEY;

  if (!key) return [];

  const url = `https://api.sportsdata.io/v4/soccer/scores/json/GamesByDate/${date}?key=${encodeURIComponent(
    key,
  )}`;
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!response.ok) return [];
  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((game): game is UnknownRecord => Boolean(game) && typeof game === "object")
    .map(toSportsDataGame);
}

async function fetchSportsDbDay(date: string): Promise<SportsDbEvent[]> {
  const key = process.env.THESPORTSDB_KEY || "3";
  const url = `https://www.thesportsdb.com/api/v1/json/${key}/eventsday.php?d=${date}&s=Soccer`;
  const response = await fetch(url, { next: { revalidate: 60 }, signal: AbortSignal.timeout(3500) });
  if (!response.ok) return [];
  const payload = (await response.json()) as { events?: SportsDbEvent[] | null };
  return Array.isArray(payload.events) ? payload.events : [];
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

export async function getScores(requestedDate = todayYmd()): Promise<ScoresResult> {
  const date = isYmd(requestedDate) ? requestedDate : todayYmd();

  try {
    const sportsDataGames = await fetchSportsDataDay(date);
    if (sportsDataGames.length > 0) {
      return { source: "sportsdata", date, games: selectGames(sportsDataGames) };
    }

    const events = await fetchSportsDbDay(date);
    if (events.length === 0) {
      return { source: "mock", date, games: MOCK_GAMES };
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
    return { source: "thesportsdb", date, games: selected.length > 0 ? selected : [] };
  } catch (error) {
    console.error("getScores: live score fetch failed", error);
    return { source: "mock", date, games: MOCK_GAMES };
  }
}
