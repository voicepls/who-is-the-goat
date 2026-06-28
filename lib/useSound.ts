"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerKey } from "@/lib/useVotes";

const SOUND_SRC: Record<PlayerKey, string> = {
  ron: "/sounds/ron.mp3",
  mes: "/sounds/mes.mp3",
};

const MUTE_KEY = "goat_muted";
const PLAY_THROTTLE_MS = 180;

export function useSound() {
  const [muted, setMuted] = useState(false);

  const mutedRef = useRef(false);
  const audioRef = useRef<Record<PlayerKey, HTMLAudioElement | null>>({ ron: null, mes: null });
  const mp3ReadyRef = useRef<Record<PlayerKey, boolean>>({ ron: false, mes: false });
  const ctxRef = useRef<AudioContext | null>(null);
  const lastPlayRef = useRef(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(MUTE_KEY) === "1") {
        setMuted(true);
        mutedRef.current = true;
      }
    } catch {
      mutedRef.current = false;
    }

    (Object.keys(SOUND_SRC) as PlayerKey[]).forEach((player) => {
      const audio = new Audio(SOUND_SRC[player]);
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => {
        mp3ReadyRef.current[player] = true;
      });
      audio.addEventListener("error", () => {
        mp3ReadyRef.current[player] = false;
      });
      audioRef.current[player] = audio;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        mutedRef.current = next;
      }
      return next;
    });
  }, []);

  const getCtx = useCallback(() => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = ctxRef.current ?? (ctxRef.current = new Ctx());
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }, []);

  const synth = useCallback(
    (player: PlayerKey) => {
      const ctx = getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = player === "ron" ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25, 880];
      const type: OscillatorType = player === "ron" ? "sawtooth" : "triangle";

      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        const start = now + index * 0.09;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
        osc.connect(gain).connect(master);
        osc.start(start);
        osc.stop(start + 0.27);
      });
    },
    [getCtx],
  );

  const play = useCallback(
    (player: PlayerKey) => {
      if (mutedRef.current) return;

      const now = Date.now();
      if (now - lastPlayRef.current < PLAY_THROTTLE_MS) return;
      lastPlayRef.current = now;

      getCtx();

      const audio = audioRef.current[player];
      if (audio && mp3ReadyRef.current[player]) {
        try {
          audio.currentTime = 0;
          const promise = audio.play();
          if (promise) promise.catch(() => synth(player));
          return;
        } catch {
          synth(player);
          return;
        }
      }
      synth(player);
    },
    [getCtx, synth],
  );

  return { play, muted, toggleMute };
}
