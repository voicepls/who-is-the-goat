"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Stat = {
  label: string;
  ron: number;
  mes: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

const STATS: Stat[] = [
  { label: "Club goals", ron: 739, mes: 727 },
  { label: "International goals", ron: 137, mes: 112 },
  { label: "Ballon d'Or", ron: 5, mes: 8 },
  { label: "World Cup titles", ron: 0, mes: 1 },
  { label: "Estimated 2024 earnings", ron: 260, mes: 150, prefix: "$", suffix: "M" },
];

function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(value);
  const startRef = useRef(value);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(startRef.current, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    startRef.current = value;
    return () => controls.stop();
  }, [inView, value]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString("en-US");

  return <span ref={ref}>{`${prefix}${formatted}${suffix}`}</span>;
}

function StatRow({ stat, index }: { stat: Stat; index: number }) {
  const total = stat.ron + stat.mes;
  const ronShare = total === 0 ? 50 : (stat.ron / total) * 100;
  const ronLeads = stat.ron > stat.mes;
  const mesLeads = stat.mes > stat.ron;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="goat-stat-row border-b border-white/10 px-3 py-3 last:border-0 sm:px-4"
    >
      <div className="goat-stat-grid grid grid-cols-[1.25fr_0.85fr_0.85fr] items-center">
        <span className="goat-stat-label text-sm font-bold text-slate-300">{stat.label}</span>
        <span
          className={`goat-stat-value text-right text-lg font-black tabular-nums transition-colors ${
            ronLeads ? "text-blue-300" : "text-white"
          }`}
        >
          <CountUp value={stat.ron} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
        </span>
        <span
          className={`goat-stat-value text-right text-lg font-black tabular-nums transition-colors ${
            mesLeads ? "text-emerald-300" : "text-white"
          }`}
        >
          <CountUp value={stat.mes} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
        </span>
      </div>

      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-ron"
          initial={{ width: "50%" }}
          whileInView={{ width: `${ronShare}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.06 }}
        />
        <div className="h-full flex-1 bg-mes" />
      </div>
    </motion.div>
  );
}

export default function StatsPanel() {
  return (
    <section className="goat-stats-section grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[0.78fr_1fr]">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Career stats</p>
        <h2 className="mt-1 text-2xl font-black text-white">Numbers for the group chat</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Hardcoded headline numbers for the debate. The bar shows who leads each line.
        </p>
      </motion.div>

      <div className="goat-stats-card overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
        <div className="goat-stat-header grid grid-cols-[1.25fr_0.85fr_0.85fr] border-b border-white/10 bg-white/[0.045] px-3 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400 sm:px-4">
          <span>Stat</span>
          <span className="text-right text-blue-200">Ronaldo</span>
          <span className="text-right text-emerald-200">Messi</span>
        </div>

        {STATS.map((stat, index) => (
          <StatRow key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}
