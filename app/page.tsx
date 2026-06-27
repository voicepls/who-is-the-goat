"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import MessiAvatar from "@/components/MessiAvatar";
import RonaldoAvatar from "@/components/RonaldoAvatar";
import StatsPanel from "@/components/StatsPanel";
import VoteBar from "@/components/VoteBar";
import WCScores from "@/components/WCScores";
import { PlayerKey, useVotes } from "@/lib/useVotes";

function getReactionCopy(
  ronaldoPercent: number,
  messiPercent: number,
  votedPlayer: PlayerKey | null,
) {
  const diff = Math.abs(ronaldoPercent - messiPercent);

  if (votedPlayer) {
    return "Your vote has been counted. Choose wisely.";
  }

  if (diff < 5) {
    return "The debate never ends... vote to break the tie!";
  }

  if (ronaldoPercent - messiPercent > 40) {
    return "SUIIIIII! CR7 nation eating good tonight 🔥";
  }

  if (messiPercent - ronaldoPercent > 40) {
    return "The GOAT has spoken. No debate. 🐐";
  }

  if (ronaldoPercent - messiPercent > 20) {
    return "Ronaldo has the timeline yelling SUIII right now.";
  }

  if (messiPercent - ronaldoPercent > 20) {
    return "Messi magic is turning this vote into a rondo.";
  }

  return "Still too close. Group chat arguments remain undefeated.";
}

function getAvatarState(ronaldoPercent: number, messiPercent: number) {
  const diff = Math.abs(ronaldoPercent - messiPercent);

  if (diff < 5) {
    return { ronaldo: "neutral", messi: "neutral" } as const;
  }

  if (ronaldoPercent - messiPercent > 40) {
    return { ronaldo: "dominant", messi: "losingBig" } as const;
  }

  if (messiPercent - ronaldoPercent > 40) {
    return { ronaldo: "losingBig", messi: "dominant" } as const;
  }

  if (ronaldoPercent - messiPercent > 20) {
    return { ronaldo: "winning", messi: "losing" } as const;
  }

  if (messiPercent - ronaldoPercent > 20) {
    return { ronaldo: "losing", messi: "winning" } as const;
  }

  return { ronaldo: "neutral", messi: "neutral" } as const;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function Home() {
  const { counts, hasVoted, votedPlayer, isReady, isVoting, total, percentages, vote } = useVotes();
  const avatarState = getAvatarState(percentages.ron, percentages.mes);
  const reactionCopy = getReactionCopy(percentages.ron, percentages.mes, votedPlayer);

  const submitVote = async (player: PlayerKey) => {
    const didVote = await vote(player);

    if (!didVote) {
      return;
    }

    const origin = player === "ron" ? { x: 0.25, y: 0.48 } : { x: 0.75, y: 0.48 };

    confetti({
      particleCount: 130,
      spread: 76,
      startVelocity: 48,
      origin,
      colors: player === "ron" ? ["#185FA5", "#ffffff", "#c7d2fe"] : ["#1D9E75", "#ffffff", "#bfdbfe"],
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-night text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
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

          <motion.div
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 28px rgba(239,68,68,0.5)", "0 0 0 rgba(239,68,68,0)"] }}
            transition={{ repeat: Infinity, duration: 1.45, ease: "easeInOut" }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/30 bg-red-500/[0.12] px-4 py-2 text-sm font-black text-red-200"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            LIVE
          </motion.div>
        </header>

        <section className="grid flex-1 items-center gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)]">
          <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
            <motion.article
              layout
              className="relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-glowBlue backdrop-blur md:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-ron" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/80">Portugal · No. 7</p>
                  <h2 className="mt-1 text-3xl font-black text-white">Cristiano Ronaldo</h2>
                </div>
                <div className="rounded-md border border-white/10 bg-ron/20 px-3 py-2 text-right">
                  <p className="text-xs font-bold text-blue-100/80">Votes</p>
                  <p className="text-xl font-black text-white">{formatNumber(counts.ron)}</p>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center py-3">
                <RonaldoAvatar state={avatarState.ronaldo} />
              </div>

              <button
                type="button"
                disabled={!isReady || hasVoted || isVoting}
                onClick={() => submitVote("ron")}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-ron px-5 text-base font-black text-white shadow-glowBlue transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vote Ronaldo
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            </motion.article>

            <motion.article
              layout
              className="relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-glowGreen backdrop-blur md:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-mes" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/80">Argentina · No. 10</p>
                  <h2 className="mt-1 text-3xl font-black text-white">Lionel Messi</h2>
                </div>
                <div className="rounded-md border border-white/10 bg-mes/20 px-3 py-2 text-right">
                  <p className="text-xs font-bold text-emerald-100/80">Votes</p>
                  <p className="text-xl font-black text-white">{formatNumber(counts.mes)}</p>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center py-3">
                <MessiAvatar state={avatarState.messi} />
              </div>

              <button
                type="button"
                disabled={!isReady || hasVoted || isVoting}
                onClick={() => submitVote("mes")}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-mes px-5 text-base font-black text-white shadow-glowGreen transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vote Messi
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            </motion.article>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Live vote meter</p>
                  <h2 className="text-2xl font-black text-white">{formatNumber(total)} total votes</h2>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">
                  {hasVoted ? "Locked in" : "Vote once"}
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
            </section>

            <WCScores />
          </aside>
        </section>

        <StatsPanel />
      </section>
    </main>
  );
}
