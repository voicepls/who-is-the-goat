"use client";

import { motion, animate } from "framer-motion";
import { useState, useEffect, useRef, type ReactNode } from "react";
import type { PlayerKey } from "@/lib/useVotes";

const THEME: Record<
  PlayerKey,
  { accent: string; glow: string; metaText: string; votesBox: string; votesLabel: string }
> = {
  ron: {
    accent: "bg-ron",
    glow: "shadow-glowBlue",
    metaText: "text-blue-200/80",
    votesBox: "bg-ron/20",
    votesLabel: "text-blue-100/80",
  },
  mes: {
    accent: "bg-mes",
    glow: "shadow-glowGreen",
    metaText: "text-emerald-200/80",
    votesBox: "bg-mes/20",
    votesLabel: "text-emerald-100/80",
  },
};

type FUTStat = { label: string; value: number };
const FUT_STATS: Record<PlayerKey, FUTStat[]> = {
  ron: [
    { label: "PAC", value: 87 },
    { label: "SHO", value: 92 },
    { label: "PAS", value: 80 },
    { label: "DRI", value: 85 },
    { label: "DEF", value: 42 },
    { label: "PHY", value: 89 },
  ],
  mes: [
    { label: "PAC", value: 85 },
    { label: "SHO", value: 89 },
    { label: "PAS", value: 94 },
    { label: "DRI", value: 93 },
    { label: "DEF", value: 38 },
    { label: "PHY", value: 68 },
  ],
};

type PlayerCardProps = {
  player: PlayerKey;
  name: string;
  meta: string;
  votes: number; // changed from string to number
  avatar: ReactNode;
  disabled: boolean;
  isLeader: boolean;
  ctaLabel?: string;
  onVote: () => void;
};

type Floater = { id: number; x: number; y: number; text: string };

function VoteCountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(value);

  useEffect(() => {
    const controls = animate(startRef.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    startRef.current = value;
    return () => controls.stop();
  }, [value]);

  return <span>{Math.round(display).toLocaleString("en-US")}</span>;
}

export default function PlayerCard({
  player,
  name,
  meta,
  votes,
  avatar,
  disabled,
  isLeader,
  ctaLabel,
  onVote,
}: PlayerCardProps) {
  const theme = THEME[player];
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [streak, setStreak] = useState(0);
  const streakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onVote();
    
    // Manage Click Streak
    setStreak((prev) => prev + 1);

    if (streakTimeoutRef.current) clearTimeout(streakTimeoutRef.current);
    streakTimeoutRef.current = setTimeout(() => {
      setStreak(0);
    }, 1500);

    // Calculate click coordinates relative to the card container
    const cardElement = e.currentTarget.closest(".goat-player-card");
    if (!cardElement) return;
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const textPool = player === "ron"
      ? ["+1 HYPE!", "SUIII! 🔥", "CR7! 👑", "+1", "+10!", "SIUUU!"]
      : ["+1 HYPE!", "MAGIC! 🐐", "LM10! ✨", "+1", "+10!", "ANKARA!"];
    const text = textPool[Math.floor(Math.random() * textPool.length)];
    
    const id = Date.now() + Math.random();
    setFloaters((prev) => [...prev, { id, x, y, text }]);
    
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 900);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (streakTimeoutRef.current) clearTimeout(streakTimeoutRef.current);
    };
  }, []);

  return (
    <motion.article
      layout
      data-player={player}
      data-leader={isLeader}
      className={`goat-player-card relative flex min-h-[580px] flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 ${theme.glow} backdrop-blur md:p-5`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />
      
      {/* Click Streak Badge */}
      {streak >= 3 && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [1, 1.12, 1], opacity: 1 }}
          key={streak} // key is streak to trigger bounce animation on count change
          className={`absolute left-4 top-24 z-20 rounded-full px-3 py-1 text-xs font-black text-white shadow-lg flex items-center gap-1 uppercase tracking-wider ${
            streak >= 25
              ? "bg-red-600 shadow-red-600/40 animate-pulse"
              : streak >= 12
              ? "bg-amber-500 shadow-amber-500/35"
              : "bg-blue-600 shadow-blue-600/30"
          }`}
        >
          <span>🔥</span>
          <span>
            {streak >= 25 ? "GODLIKE" : streak >= 12 ? "MEGA" : "STREAK"} x{streak}
          </span>
        </motion.div>
      )}

      {/* Floating combo elements */}
      {floaters.map((f) => (
        <span
          key={f.id}
          className="hype-floater text-xl font-black italic"
          style={{
            left: `${f.x}px`,
            top: `${f.y}px`,
            color: player === "ron" ? "#60a5fa" : "#34d399",
          }}
        >
          {f.text}
        </span>
      ))}

      {/* Header Info */}
      <div className="goat-card-head flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${theme.metaText}`}>{meta}</p>
          <h2 className="goat-player-name mt-1 text-3xl font-black text-white">{name}</h2>
        </div>
        <div className={`goat-vote-count-box rounded-md border border-white/10 ${theme.votesBox} px-3 py-2 text-right`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.votesLabel}`}>Votes</p>
          <p className="text-xl font-black text-white"><VoteCountUp value={votes} /></p>
        </div>
      </div>

      {/* Caricature Stage */}
      <div className="goat-card-avatar flex flex-1 items-center justify-center py-3">
        {avatar}
      </div>

      {/* Collectible Stats attributes (FUT style) */}
      <div className="fut-stats-grid">
        {FUT_STATS[player].map((s) => (
          <div key={s.label} className="fut-stat-col">
            <span className="fut-stat-val">{s.value}</span>
            <span className="fut-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Vote Action Button */}
      <button
        type="button"
        data-player={player}
        disabled={disabled}
        onClick={handleButtonClick}
        className={`goat-vote-button group mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-md ${theme.accent} px-5 text-base font-black text-white ${theme.glow} transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {ctaLabel ?? `Vote ${name.split(" ")[0]}`}
        {!disabled && (
          <span aria-hidden="true" className="transition group-hover:translate-x-1">
            →
          </span>
        )}
      </button>
    </motion.article>
  );
}
