"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import AdSlot from "@/components/AdSlot";
import ImageAvatar from "@/components/ImageAvatar";
import MessiAvatar from "@/components/MessiAvatar";
import PlayerCard from "@/components/PlayerCard";
import RonaldoAvatar from "@/components/RonaldoAvatar";
import StatsPanel from "@/components/StatsPanel";
import VoteBar from "@/components/VoteBar";
import WCScores from "@/components/WCScores";
import { useSound } from "@/lib/useSound";
import { PlayerKey, useVotes } from "@/lib/useVotes";

const RON_AVATAR = process.env.NEXT_PUBLIC_RON_AVATAR;
const RON_AVATAR_SAD = process.env.NEXT_PUBLIC_RON_AVATAR_SAD;
const MES_AVATAR = process.env.NEXT_PUBLIC_MES_AVATAR;
const MES_AVATAR_SAD = process.env.NEXT_PUBLIC_MES_AVATAR_SAD;

function getReactionCopy(ronaldoPercent: number, messiPercent: number) {
  const diff = ronaldoPercent - messiPercent;
  const gap = Math.abs(diff);

  if (gap < 4) return "Knife edge. Keep tapping to break the tie!";
  if (diff > 40) return "SUIIIIII! CR7 nation eating good tonight 🔥";
  if (diff < -40) return "The GOAT has spoken. No debate. 🐐";
  if (diff > 20) return "Ronaldo has the timeline yelling SUIII right now.";
  if (diff < -20) return "Messi magic is turning this vote into a rondo.";
  if (diff > 8) return "Ronaldo edging ahead — Messi fans, do something.";
  if (diff < -8) return "Messi nudging in front. CR7 army, wake up.";
  return "Too close to call. Group chat wars continue.";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export default function Home() {
  const { counts, total, percentages, myVoteTotal, isReady, isLive, vote } = useVotes();
  const { play, muted, toggleMute } = useSound();
  const reduceMotion = useReducedMotion();
  const reactionCopy = getReactionCopy(percentages.ron, percentages.mes);
  const lastConfettiRef = useRef(0);

  const ronaldoMood = percentages.ron - percentages.mes;
  const messiMood = -ronaldoMood;

  const submitVote = (player: PlayerKey) => {
    if (!vote(player)) return;
    play(player);
    if (reduceMotion) return;

    const now = Date.now();
    if (now - lastConfettiRef.current > 220) {
      lastConfettiRef.current = now;
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 42,
        origin: player === "ron" ? { x: 0.25, y: 0.5 } : { x: 0.75, y: 0.5 },
        colors:
          player === "ron"
            ? ["#185FA5", "#ffffff", "#c7d2fe"]
            : ["#1D9E75", "#ffffff", "#bfdbfe"],
      });
    }
  };

  const ronAvatar = RON_AVATAR ? (
    <ImageAvatar src={RON_AVATAR} sadSrc={RON_AVATAR_SAD || undefined} mood={ronaldoMood} alt="Cristiano Ronaldo avatar" winEmoji="🔥" />
  ) : (
    <RonaldoAvatar mood={ronaldoMood} />
  );

  const mesAvatar = MES_AVATAR ? (
    <ImageAvatar src={MES_AVATAR} sadSrc={MES_AVATAR_SAD || undefined} mood={messiMood} alt="Lionel Messi avatar" winEmoji="🐐" />
  ) : (
    <MessiAvatar mood={messiMood} />
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-night text-slate-50">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-24 top-4 h-80 w-80 rounded-full bg-ron/20 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-4 h-96 w-96 rounded-full bg-mes/20 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -28, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        />
        {["⚽", "🐐", "⚽"].map((emoji, index) => (
          <motion.span
            key={index}
            className="absolute text-2xl opacity-[0.07]"
            style={{ left: `${15 + index * 32}%`, bottom: "-40px" }}
            animate={{ y: [0, -700], rotate: [0, 220] }}
            transition={{ repeat: Infinity, duration: 22 + index * 5, ease: "linear", delay: index * 4 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 pb-28 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-2 flex items-center gap-3"
            >
              <motion.span
                aria-hidden="true"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="text-4xl"
              >
                🐐
              </motion.span>
              <h1 className="text-4xl font-black tracking-normal text-white sm:text-5xl lg:text-6xl">
                Who is the GOAT?
              </h1>
            </motion.div>
            <p className="max-w-2xl text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Ronaldo vs Messi · FIFA World Cup 2026 edition
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute sounds" : "Mute sounds"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg transition hover:bg-white/10"
            >
              {muted ? "🔇" : "🔊"}
            </button>

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 28px rgba(239,68,68,0.5)", "0 0 0 rgba(239,68,68,0)"],
              }}
              transition={{ repeat: Infinity, duration: 1.45, ease: "easeInOut" }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/[0.12] px-4 py-2 text-sm font-black text-red-200"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              LIVE
            </motion.div>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)]">
          <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
            <PlayerCard
              player="ron"
              name="Cristiano Ronaldo"
              meta="Portugal · No. 7"
              votes={formatNumber(counts.ron)}
              avatar={ronAvatar}
              disabled={!isReady}
              onVote={() => submitVote("ron")}
            />
            <PlayerCard
              player="mes"
              name="Lionel Messi"
              meta="Argentina · No. 10"
              votes={formatNumber(counts.mes)}
              avatar={mesAvatar}
              disabled={!isReady}
              onVote={() => submitVote("mes")}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <section
              role="status"
              aria-live="polite"
              className="rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur md:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Live vote meter</p>
                  <h2 className="text-2xl font-black text-white">{formatNumber(total)} total votes</h2>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">
                  {isLive ? "Live · Neon" : "Demo mode"}
                </div>
              </div>

              <VoteBar ronaldoPercent={percentages.ron} messiPercent={percentages.mes} />

              <AnimatePresence mode="wait">
                <motion.p
                  key={reactionCopy}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24 }}
                  className="mt-4 min-h-12 rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-slate-100"
                >
                  {reactionCopy}
                </motion.p>
              </AnimatePresence>

              <p className="mt-3 text-center text-xs font-bold text-slate-400">
                {myVoteTotal > 0
                  ? `You've hyped ${formatNumber(myVoteTotal)} time${myVoteTotal === 1 ? "" : "s"} — keep tapping! 👆`
                  : "Tap a player as many times as you want 👆"}
              </p>
            </section>

            <WCScores />

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} minHeight={250} />
          </aside>
        </section>

        <StatsPanel />
      </section>
    </main>
  );
}
