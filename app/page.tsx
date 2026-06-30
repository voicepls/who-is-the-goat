"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import AdSlot from "@/components/AdSlot";
import ImageAvatar from "@/components/ImageAvatar";
import PlayerCard from "@/components/PlayerCard";
import StatsPanel from "@/components/StatsPanel";
import VoteBar from "@/components/VoteBar";
import WCScores from "@/components/WCScores";
import { getPlayerAvatarImage } from "@/lib/avatarImages";
import { useSound } from "@/lib/useSound";
import { PlayerKey, useVotes } from "@/lib/useVotes";

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
  const {
    counts,
    total,
    percentages,
    myVoteTotal,
    isReady,
    isLive,
    vote,
    resetVotes,
  } = useVotes();
  const { play, muted, toggleMute } = useSound();
  const reduceMotion = useReducedMotion();
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [flash, setFlash] = useState(false);
  const [careerStats, setCareerStats] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/career-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setCareerStats(data.stats);
      })
      .catch((err) => console.error("Failed to load career stats", err));
  }, []);

  const reactionCopy = getReactionCopy(percentages.ron, percentages.mes);
  const lastConfettiRef = useRef(0);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-noir">
        <motion.div
          animate={{
            scale: [0.97, 1.03, 0.97],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex flex-col items-center"
        >
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] text-3xl font-black italic tracking-widest text-white shadow-[0_0_35px_rgba(255,255,255,0.06)] font-space">
            VS
            <div className="absolute inset-0 rounded-full border border-white/5 animate-ping" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit">
            Entering Arena...
          </p>
        </motion.div>
      </div>
    );
  }

  const ronaldoMood = percentages.ron - percentages.mes;
  const messiMood = -ronaldoMood;
  const ronaldoImage = getPlayerAvatarImage("ron", percentages.ron, percentages.mes);
  const messiImage = getPlayerAvatarImage("mes", percentages.mes, percentages.ron);

  const submitVote = (player: PlayerKey) => {
    if (!vote(player)) return;
    if (resetMessage) setResetMessage("");
    play(player);
    
    // Trigger camera flash/stadium light pulse
    setFlash(true);
    setTimeout(() => setFlash(false), 120);

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

  const submitReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    setResetMessage("Resetting votes...");
    const ok = await resetVotes();
    setResetMessage(ok ? "Votes reset. Pick your GOAT again." : "Reset failed. Add the reset token in production.");
    setIsResetting(false);
  };

  const ronAvatar = (
    <ImageAvatar
      player="ron"
      src={ronaldoImage.src}
      mood={ronaldoMood}
      alt={`Cristiano Ronaldo ${ronaldoImage.level}% ${ronaldoImage.emotion} avatar`}
      winEmoji="🔥"
    />
  );

  const mesAvatar = (
    <ImageAvatar
      player="mes"
      src={messiImage.src}
      mood={messiMood}
      alt={`Lionel Messi ${messiImage.level}% ${messiImage.emotion} avatar`}
      winEmoji="🐐"
    />
  );

  return (
    <main className={`goat-page relative min-h-screen overflow-x-hidden bg-night text-slate-50 transition-all duration-100 ${flash ? "brightness-125 saturate-110" : ""}`}>
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

      <section className="goat-shell relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 pb-28 sm:px-6 lg:px-8">
        <header className="goat-header flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
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
              <h1 className="text-[clamp(2.35rem,11vw,3.75rem)] font-black leading-none tracking-normal text-white">
                Who is the GOAT?
              </h1>
            </motion.div>
            <p className="max-w-2xl text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Ronaldo vs Messi · FIFA World Cup 2026 edition
            </p>
          </div>

          <div className="goat-header-actions flex items-center gap-3">
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

        <section className="goat-main-grid grid flex-1 items-center gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)]">
          <div className="goat-player-grid grid min-h-[620px] gap-4 lg:grid-cols-2">
            <PlayerCard
              player="ron"
              name="Cristiano Ronaldo"
              meta="Portugal · No. 7"
              votes={counts.ron}
              avatar={ronAvatar}
              disabled={!isReady}
              isLeader={percentages.ron > percentages.mes}
              ctaLabel="Vote Cristiano"
              onVote={() => submitVote("ron")}
            />
            <PlayerCard
              player="mes"
              name="Lionel Messi"
              meta="Argentina · No. 10"
              votes={counts.mes}
              avatar={mesAvatar}
              disabled={!isReady}
              isLeader={percentages.mes > percentages.ron}
              ctaLabel="Vote Lionel"
              onVote={() => submitVote("mes")}
            />
          </div>

          <aside className="goat-sidebar flex flex-col gap-4">
            <section
              role="status"
              aria-live="polite"
              className="goat-panel rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur md:p-5"
            >
              <div className="goat-meter-head mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Live vote meter</p>
                  <h2 className="text-2xl font-black text-white">{formatNumber(total)} total votes</h2>
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
                {resetMessage ||
                  (myVoteTotal > 0
                    ? `You've hyped ${formatNumber(myVoteTotal)} time${myVoteTotal === 1 ? "" : "s"} — keep tapping!`
                    : "Tap a player as many times as you want")}
              </p>
            </section>

            <WCScores />

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} minHeight={180} />
          </aside>
        </section>

        <StatsPanel ronVotes={counts.ron} mesVotes={counts.mes} careerStats={careerStats} />
      </section>
    </main>
  );
}
