"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type PlayerKey = "ron" | "mes";

type Counts = Record<PlayerKey, number>;

const BASE_COUNTS: Counts = {
  ron: 5420,
  mes: 4890,
};

const STORAGE_KEY = "goat_voted";

function getPercentages(counts: Counts) {
  const total = counts.ron + counts.mes;

  if (total === 0) {
    return { ron: 50, mes: 50 };
  }

  const ron = (counts.ron / total) * 100;
  const mes = 100 - ron;

  return { ron, mes };
}

async function fetchPlayerCount(player: PlayerKey) {
  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("player", player);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export function useVotes() {
  const [remoteCounts, setRemoteCounts] = useState<Counts>({ ron: 0, mes: 0 });
  const [localCounts, setLocalCounts] = useState<Counts>({ ron: 0, mes: 0 });
  const [votedPlayer, setVotedPlayer] = useState<PlayerKey | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const counts = useMemo(
    () => ({
      ron: BASE_COUNTS.ron + remoteCounts.ron + localCounts.ron,
      mes: BASE_COUNTS.mes + remoteCounts.mes + localCounts.mes,
    }),
    [localCounts, remoteCounts],
  );

  const total = counts.ron + counts.mes;
  const percentages = useMemo(() => getPercentages(counts), [counts]);
  const hasVoted = Boolean(votedPlayer);

  const refreshCounts = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const [ron, mes] = await Promise.all([fetchPlayerCount("ron"), fetchPlayerCount("mes")]);
    setRemoteCounts({ ron, mes });
  }, []);

  useEffect(() => {
    const storedVote = window.localStorage.getItem(STORAGE_KEY);

    if (storedVote === "ron" || storedVote === "mes") {
      setVotedPlayer(storedVote);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateCounts = async () => {
      try {
        await refreshCounts();
      } catch {
        if (!cancelled) {
          setRemoteCounts({ ron: 0, mes: 0 });
        }
      }
    };

    hydrateCounts();

    return () => {
      cancelled = true;
    };
  }, [refreshCounts]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    const channel = client
      .channel("goat-votes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes" },
        () => {
          refreshCounts().catch(() => undefined);
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [refreshCounts]);

  const vote = useCallback(
    async (player: PlayerKey) => {
      if (!isReady || isVoting || votedPlayer) {
        return false;
      }

      setIsVoting(true);

      try {
        if (supabase) {
          const { error } = await supabase.from("votes").insert({ player });

          if (error) {
            throw error;
          }

          await refreshCounts();
        } else {
          setLocalCounts((current) => ({
            ...current,
            [player]: current[player] + 1,
          }));
        }

        window.localStorage.setItem(STORAGE_KEY, player);
        setVotedPlayer(player);
        return true;
      } catch {
        setLocalCounts((current) => ({
          ...current,
          [player]: current[player] + 1,
        }));
        window.localStorage.setItem(STORAGE_KEY, player);
        setVotedPlayer(player);
        return true;
      } finally {
        setIsVoting(false);
      }
    },
    [isReady, isVoting, refreshCounts, votedPlayer],
  );

  return {
    counts,
    hasVoted,
    isReady,
    isVoting,
    percentages,
    total,
    vote,
    votedPlayer,
  };
}
