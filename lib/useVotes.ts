"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_AMOUNT_PER_REQUEST, SEED_COUNTS, type PlayerKey } from "@/lib/players";

export type { PlayerKey };

type Counts = Record<PlayerKey, number>;

const FLUSH_IDLE_MS = 1800;
const FLUSH_MAX_WAIT_MS = 8000;
const CLICK_COOLDOWN_MS = 70;

function getPercentages(counts: Counts) {
  const total = counts.ron + counts.mes;
  if (total === 0) return { ron: 50, mes: 50 };
  const ron = (counts.ron / total) * 100;
  return { ron, mes: 100 - ron };
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
        }
      } catch {
        if (cancelled) return;
        setEnabled(false);
        enabledRef.current = false;
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    pull();
    return () => {
      cancelled = true;
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, []);

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
      }
      return true;
    },
    [isReady, scheduleFlush, syncUnsyncedState],
  );

  return {
    counts,
    percentages,
    total,
    myVotes,
    myVoteTotal: myVotes.ron + myVotes.mes,
    isReady,
    isLive: enabled === true,
    vote,
  };
}
