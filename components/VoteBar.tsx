"use client";

import { motion } from "framer-motion";

type VoteBarProps = {
  ronaldoPercent: number;
  messiPercent: number;
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function VoteBar({ ronaldoPercent, messiPercent }: VoteBarProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-sm font-black">
        <span className="text-blue-200">Ronaldo {formatPercent(ronaldoPercent)}</span>
        <span className="text-emerald-200">Messi {formatPercent(messiPercent)}</span>
      </div>

      <div className="relative h-7 overflow-hidden rounded-md border border-white/10 bg-white/[0.08]">
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ width: `${ronaldoPercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="absolute inset-y-0 left-0 bg-ron"
        />
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ width: `${messiPercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          className="absolute inset-y-0 right-0 bg-mes"
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/35" />
      </div>
    </div>
  );
}
