"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
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

type PlayerCardProps = {
  player: PlayerKey;
  name: string;
  meta: string;
  votes: string;
  avatar: ReactNode;
  disabled: boolean;
  ctaLabel?: string;
  onVote: () => void;
};

export default function PlayerCard({
  player,
  name,
  meta,
  votes,
  avatar,
  disabled,
  ctaLabel,
  onVote,
}: PlayerCardProps) {
  const theme = THEME[player];

  return (
    <motion.article
      layout
      data-player={player}
      className={`goat-player-card relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 ${theme.glow} backdrop-blur md:p-5`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`} />
      <div className="goat-card-head flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${theme.metaText}`}>{meta}</p>
          <h2 className="goat-player-name mt-1 text-3xl font-black text-white">{name}</h2>
        </div>
        <div className={`goat-vote-count-box rounded-md border border-white/10 ${theme.votesBox} px-3 py-2 text-right`}>
          <p className={`text-xs font-bold ${theme.votesLabel}`}>Votes</p>
          <p className="text-xl font-black text-white">{votes}</p>
        </div>
      </div>

      <div className="goat-card-avatar flex flex-1 items-center justify-center py-3">{avatar}</div>

      <button
        type="button"
        data-player={player}
        disabled={disabled}
        onClick={onVote}
        className={`goat-vote-button group inline-flex h-14 w-full items-center justify-center gap-2 rounded-md ${theme.accent} px-5 text-base font-black text-white ${theme.glow} transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
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
