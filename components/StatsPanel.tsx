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
  { label: "Club goals", ron: 830, mes: 794 },
  { label: "International goals", ron: 145, mes: 123 },
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

export default function StatsPanel({
  ronVotes,
  mesVotes,
  careerStats,
}: {
  ronVotes: number;
  mesVotes: number;
  careerStats?: Stat[];
}) {
  const [velocity, setVelocity] = useState({ ron: 0, mes: 0 });
  const historyRef = useRef<{ time: number; ron: number; mes: number }[]>([]);

  // Calculate live voting velocity (taps/minute) based on sliding 8-second window
  useEffect(() => {
    const now = Date.now();
    historyRef.current.push({ time: now, ron: ronVotes, mes: mesVotes });

    const limit = now - 8000;
    historyRef.current = historyRef.current.filter((h) => h.time > limit);

    if (historyRef.current.length > 1) {
      const first = historyRef.current[0];
      const last = historyRef.current[historyRef.current.length - 1];
      const dt = (last.time - first.time) / 1000; // time delta in seconds
      if (dt > 1.5) {
        const ronSpeed = ((last.ron - first.ron) / dt) * 60;
        const mesSpeed = ((last.mes - first.mes) / dt) * 60;
        setVelocity({ ron: Math.max(0, ronSpeed), mes: Math.max(0, mesSpeed) });
      }
    }
  }, [ronVotes, mesVotes]);

  const diff = ronVotes - mesVotes;
  const absDiff = Math.abs(diff);

  const getDeficitMessage = () => {
    if (diff === 0) return "Tied arena! Next vote takes the lead.";
    if (diff > 0) {
      return `Ronaldo leads by ${absDiff.toLocaleString()} votes. Messi needs ${absDiff.toLocaleString()} to tie!`;
    } else {
      return `Messi leads by ${absDiff.toLocaleString()} votes. Ronaldo needs ${absDiff.toLocaleString()} to tie!`;
    }
  };

  const displayStats = careerStats && careerStats.length > 0 ? careerStats : STATS;

  return (
    <section className="goat-stats-section grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[0.4fr_0.8fr_0.8fr]">
      {/* Description Block */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center"
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Battle Stats</p>
        <h2 className="mt-1 text-3xl font-black text-white leading-none">Showdown Metrics</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          Live velocity gauges the current click intensity in real-time. Career showdown compares historic football stats.
        </p>
      </motion.div>

      {/* Live Arena Metrics Card */}
      <div className="goat-stats-card goat-panel flex flex-col justify-between overflow-hidden rounded-lg border border-white/10 p-5 bg-white/[0.03]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-4">Live Arena Metrics</p>
          
          {/* Live Speed (Ronaldo) */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span>CR7 HYPE VELOCITY</span>
              <span className="text-blue-300 font-space">{velocity.ron.toFixed(0)} votes/min</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                animate={{ width: `${Math.min(100, (velocity.ron / 180) * 100)}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>

          {/* Live Speed (Messi) */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span>LM10 HYPE VELOCITY</span>
              <span className="text-emerald-300 font-space">{velocity.mes.toFixed(0)} votes/min</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                animate={{ width: `${Math.min(100, (velocity.mes / 180) * 100)}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>
        </div>

        {/* Live Arena Deficit Message */}
        <div className="rounded-lg border border-white/5 bg-black/30 px-4 py-3.5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Live Momentum</p>
          <p className="text-sm font-bold text-white leading-snug">{getDeficitMessage()}</p>
        </div>
      </div>

      {/* Career Showdown Card */}
      <div className="goat-stats-card overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-0 flex flex-col">
        <div className="goat-stat-header grid grid-cols-[1.25fr_0.85fr_0.85fr] border-b border-white/10 bg-white/[0.045] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          <span>Career Stat</span>
          <span className="text-right text-blue-300">Ronaldo</span>
          <span className="text-right text-emerald-300">Messi</span>
        </div>

        <div className="flex-1 divide-y divide-white/5">
          {displayStats.map((stat, index) => (
            <StatRow key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
