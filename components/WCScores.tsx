"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type ScoreGame = {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "LIVE" | "FT" | "Upcoming";
};

const MOCK_GAMES: ScoreGame[] = [
  { id: "mock-1", home: "USA", away: "Portugal", homeScore: 1, awayScore: 1, status: "LIVE" },
  { id: "mock-2", home: "Argentina", away: "Japan", homeScore: 2, awayScore: 0, status: "FT" },
  { id: "mock-3", home: "Canada", away: "Morocco", homeScore: null, awayScore: null, status: "Upcoming" },
];

function normalizeStatus(rawStatus: unknown): ScoreGame["status"] {
  const status = String(rawStatus ?? "").toLowerCase();

  if (["inprogress", "in progress", "live", "halftime", "1h", "2h"].some((item) => status.includes(item))) {
    return "LIVE";
  }

  if (["final", "full time", "ft", "complete", "completed"].some((item) => status.includes(item))) {
    return "FT";
  }

  return "Upcoming";
}

function firstString(record: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function firstNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function normalizeGames(payload: unknown): ScoreGame[] {
  if (!Array.isArray(payload)) {
    return MOCK_GAMES;
  }

  const games = payload.slice(0, 5).map((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const id = String(record.GameId ?? record.GameID ?? record.Id ?? record.id ?? `game-${index}`);

    return {
      id,
      home: firstString(record, ["HomeTeamName", "HomeTeam", "Home", "HomeTeamKey"], "Home"),
      away: firstString(record, ["AwayTeamName", "AwayTeam", "Away", "AwayTeamKey"], "Away"),
      homeScore: firstNumber(record, ["HomeTeamScore", "HomeScore", "HomeTeamGoals", "HomeGoals"]),
      awayScore: firstNumber(record, ["AwayTeamScore", "AwayScore", "AwayTeamGoals", "AwayGoals"]),
      status: normalizeStatus(record.Status ?? record.GameStatus ?? record.Period),
    };
  });

  return games.length > 0 ? games : MOCK_GAMES;
}

function renderScore(game: ScoreGame) {
  if (game.homeScore === null || game.awayScore === null) {
    return "vs";
  }

  return `${game.homeScore} - ${game.awayScore}`;
}

export default function WCScores() {
  const [games, setGames] = useState<ScoreGame[]>(MOCK_GAMES);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchScores = async () => {
      const key = process.env.NEXT_PUBLIC_SPORTSDATA_KEY;

      if (!key) {
        setLastUpdated(new Date());
        return;
      }

      try {
        const response = await fetch(
          `https://api.sportsdata.io/v4/soccer/scores/json/GamesByDate/2026-06-28?key=${key}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(`SportsData request failed: ${response.status}`);
        }

        const payload = await response.json();

        if (!cancelled) {
          setGames(normalizeGames(payload));
          setLastUpdated(new Date());
        }
      } catch {
        if (!cancelled) {
          setGames(MOCK_GAMES);
          setLastUpdated(new Date());
        }
      }
    };

    fetchScores();
    const timer = window.setInterval(fetchScores, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">World Cup 2026</p>
          <h2 className="text-2xl font-black text-white">Live scores</h2>
        </div>
        <p className="pt-1 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {lastUpdated ? "60s refresh" : "Loading"}
        </p>
      </div>

      <div className="space-y-2">
        {games.map((game) => (
          <div key={game.id} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-3">
            <span className="truncate text-sm font-black text-white">{game.home}</span>
            <span className="min-w-14 rounded bg-white/10 px-2 py-1 text-center text-sm font-black text-white">
              {renderScore(game)}
            </span>
            <span className="truncate text-right text-sm font-black text-white">{game.away}</span>
            {game.status === "LIVE" ? (
              <motion.span
                animate={{ scale: [1, 1.08, 1], opacity: [0.82, 1, 0.82] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white"
              >
                LIVE
              </motion.span>
            ) : (
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-slate-300">
                {game.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
