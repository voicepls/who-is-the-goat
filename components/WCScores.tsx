"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MOCK_GAMES, type ScoreGame, type ScoresResult } from "@/lib/scores";

function localYmd(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatKickoff(kickoff: string | null): string {
  if (!kickoff) return "vs";
  const date = new Date(kickoff);
  if (Number.isNaN(date.getTime())) return "vs";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderScore(game: ScoreGame): string {
  if (game.homeScore !== null && game.awayScore !== null) {
    return `${game.homeScore} - ${game.awayScore}`;
  }
  return formatKickoff(game.kickoff);
}

export default function WCScores() {
  const [games, setGames] = useState<ScoreGame[]>(MOCK_GAMES);
  const [source, setSource] = useState<ScoresResult["source"]>("mock");

  useEffect(() => {
    let cancelled = false;
    const date = localYmd();

    const fetchScores = async () => {
      try {
        const response = await fetch(`/api/scores?date=${date}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = (await response.json()) as ScoresResult;
        if (cancelled) return;
        setGames(Array.isArray(data.games) ? data.games : []);
        setSource(data.source ?? "mock");
      } catch {
        if (!cancelled) {
          setGames(MOCK_GAMES);
          setSource("mock");
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
          {source !== "mock" ? "Today · 60s" : "Sample data"}
        </p>
      </div>

      <div className="space-y-2">
        {games.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-black/20 px-3 py-4 text-sm font-bold text-slate-300">
            No fixtures found for today.
          </div>
        ) : (
          games.map((game) => (
          <div
            key={game.id}
            className="goat-score-row grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-black/20 px-3 py-3"
          >
            <span className="goat-score-home truncate text-sm font-black text-white">{game.home}</span>
            <span className="goat-score-value min-w-14 rounded bg-white/10 px-2 py-1 text-center text-sm font-black tabular-nums text-white">
              {renderScore(game)}
            </span>
            <span className="goat-score-away truncate text-right text-sm font-black text-white">{game.away}</span>
            {game.status === "LIVE" ? (
              <motion.span
                animate={{ scale: [1, 1.08, 1], opacity: [0.82, 1, 0.82] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                className="goat-score-status rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white"
              >
                LIVE
              </motion.span>
            ) : (
              <span className="goat-score-status rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-slate-300">
                {game.status === "FT" ? "FT" : "Soon"}
              </span>
            )}
          </div>
          ))
        )}
      </div>
    </section>
  );
}
