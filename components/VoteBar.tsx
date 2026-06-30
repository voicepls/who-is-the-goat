"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type VoteBarProps = {
  ronaldoPercent: number;
  messiPercent: number;
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function VoteBar({ ronaldoPercent, messiPercent }: VoteBarProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 300);
    return () => clearTimeout(timer);
  }, [ronaldoPercent, messiPercent]);

  return (
    <div className="goat-votebar-container">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm font-black font-space">
        <span className="text-blue-300 drop-shadow-[0_0_10px_rgba(24,95,165,0.4)]">
          Ronaldo {formatPercent(ronaldoPercent)}
        </span>
        <span className="text-emerald-300 drop-shadow-[0_0_10px_rgba(29,158,117,0.4)]">
          Messi {formatPercent(messiPercent)}
        </span>
      </div>

      <div className="goat-votebar-rail">
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ width: `${ronaldoPercent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-700 to-ron"
        />
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ width: `${messiPercent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-600 to-mes"
        />

        <div className={`goat-votebar-vs ${pulse ? "pulse" : ""}`}>
          VS
        </div>
      </div>
    </div>
  );
}
