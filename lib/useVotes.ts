"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_AMOUNT_PER_REQUEST,
  SEED_COUNTS,
  type PlayerKey,
} from "@/lib/players";

export type { PlayerKey };

type Counts = Record<PlayerKey, number>;

const FLUSH_IDLE_MS = 1800;
const FLUSH_MAX_WAIT_MS = 8000;
const CLICK_COOLDOWN_MS = 70;
const POLL_MS = 2500;
const LOCAL_VOTES_KEY = "goat_demo_votes";

function getPercentages(counts: Counts) {
  const total = counts.ron + counts.mes;
  if (total === 0) return { ron: 50, mes: 50 };
  const ron = (counts.ron / total) * 100;
  return { ron, mes: 100 - ron };
}

function readLocalVotes(): Counts {
  try {
    const raw = window.localStorage.getItem(LOCAL_VOTES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Counts>) : {};

    return {
      ron: Math.max(0, Number(parsed.ron) || 0),
      mes: Math.max(0, Number(parsed.mes) || 0),
    };
  } catch {
    return { ron: 0, mes: 0 };
  }
}

function writeLocalVotes(counts: Counts) {
  try {
    window.localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(counts));
  } catch {
    // Ignore storage failures; the in-memory vote still updates immediately.
  }
}

function clearLocalVotes() {
  try {
    window.localStorage.removeItem(LOCAL_VOTES_KEY);
  } catch {
    // Ignore storage failures; reset still updates the in-memory UI.
  }
}

export function useVotes() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [serverTotals, setServerTotals] = useState<Counts>(SEED_COUNTS);
  const [unsynced, setUnsynced] = useState<Counts>({ ron: 0, mes: 0 });
  const [myVotes, setMyVotes] = useState<Counts>({ ron: 0, mes: 0 });
  const [isReady, setIsReady] = useState(false);

  const unsyncedRef = useRef<Counts>({ ron: 0, mes: 0 });
  const enabledRef = useRef<boolean | null>(null);
  const isFlushingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickRef = useRef(0);
  const firstUnsentAtRef = useRef(0);

  const base = enabled === false ? SEED_COUNTS : serverTotals;

  const counts = useMemo<Counts>(
    () => ({ ron: base.ron + unsynced.ron, mes: base.mes + unsynced.mes }),
    [base, unsynced],
  );

  const total = counts.ron + counts.mes;
  const percentages = useMemo(() => getPercentages(counts), [counts]);

  const syncUnsyncedState = useCallback(() => {
    setUnsynced({ ...unsyncedRef.current });
  }, []);

  const clearPendingVotes = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    firstUnsentAtRef.current = 0;
    unsyncedRef.current = { ron: 0, mes: 0 };
    setUnsynced({ ron: 0, mes: 0 });
    setMyVotes({ ron: 0, mes: 0 });
  }, []);

  const enableLocalDemoMode = useCallback(() => {
    const storedVotes = readLocalVotes();
    unsyncedRef.current = storedVotes;
    setUnsynced(storedVotes);
    setMyVotes(storedVotes);
  }, []);

  const flush = useCallback(async () => {
    if (enabledRef.current !== true) return;
    if (isFlushingRef.current) return;

    const snapshot = { ...unsyncedRef.current };
    const players = (Object.keys(snapshot) as PlayerKey[]).filter((p) => snapshot[p] > 0);
    if (players.length === 0) return;

    isFlushingRef.current = true;
    try {
      for (const player of players) {
        const amount = Math.min(snapshot[player], MAX_AMOUNT_PER_REQUEST);
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player, amount }),
        });
        if (!response.ok) throw new Error(`vote failed: ${response.status}`);

        const data = (await response.json()) as { enabled: boolean; totals: Counts };
        setEnabled(data.enabled);
        enabledRef.current = data.enabled;
        setServerTotals(data.totals);

        unsyncedRef.current[player] = Math.max(0, unsyncedRef.current[player] - amount);
        syncUnsyncedState();
      }
    } catch (error) {
      console.error("flush votes failed", error);
    } finally {
      isFlushingRef.current = false;
      if (unsyncedRef.current.ron + unsyncedRef.current.mes > 0) {
        scheduleFlush();
      } else {
        firstUnsentAtRef.current = 0;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUnsyncedState]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    const firstAt = firstUnsentAtRef.current || Date.now();
    const elapsed = Date.now() - firstAt;
    const wait = Math.max(0, Math.min(FLUSH_IDLE_MS, FLUSH_MAX_WAIT_MS - elapsed));
    flushTimerRef.current = setTimeout(() => {
      flush();
    }, wait);
  }, [flush]);

  useEffect(() => {
    let cancelled = false;

    const pull = async () => {
      try {
        const response = await fetch("/api/votes", { cache: "no-store" });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = (await response.json()) as { enabled: boolean; totals: Counts };
        if (cancelled) return;
        setEnabled(data.enabled);
        enabledRef.current = data.enabled;
        if (data.enabled && !isFlushingRef.current) {
          setServerTotals(data.totals);
        } else if (!data.enabled) {
          enableLocalDemoMode();
        }
      } catch {
        if (cancelled) return;
        setEnabled(false);
        enabledRef.current = false;
        enableLocalDemoMode();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    pull();
    const timer = window.setInterval(pull, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [enableLocalDemoMode]);

  const vote = useCallback(
    (player: PlayerKey) => {
      if (!isReady) return false;

      const now = Date.now();
      if (now - lastClickRef.current < CLICK_COOLDOWN_MS) return false;
      lastClickRef.current = now;

      unsyncedRef.current[player] += 1;
      if (firstUnsentAtRef.current === 0) firstUnsentAtRef.current = now;
      syncUnsyncedState();
      setMyVotes((current) => ({ ...current, [player]: current[player] + 1 }));

      if (enabledRef.current !== false) {
        scheduleFlush();
      } else {
        writeLocalVotes(unsyncedRef.current);
      }
      return true;
    },
    [isReady, scheduleFlush, syncUnsyncedState],
  );

  const resetVotes = useCallback(async () => {
    try {
      const response = await fetch("/api/votes", { method: "DELETE" });
      if (!response.ok) return false;

      const data = (await response.json()) as { enabled: boolean; totals: Counts };
      clearPendingVotes();
      clearLocalVotes();
      setEnabled(data.enabled);
      enabledRef.current = data.enabled;
      setServerTotals(data.totals ?? SEED_COUNTS);
      setIsReady(true);
      return true;
    } catch (error) {
      console.error("reset votes failed", error);
      return false;
    }
  }, [clearPendingVotes]);

  return {
    counts,
    percentages,
    total,
    myVotes,
    myVoteTotal: myVotes.ron + myVotes.mes,
    isReady,
    isLive: enabled === true,
    vote,
    resetVotes,
  };
}
