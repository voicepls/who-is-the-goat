export type PlayerKey = "ron" | "mes";

export const SEED_COUNTS: Record<PlayerKey, number> = {
  ron: 0,
  mes: 0,
};

export const MAX_AMOUNT_PER_REQUEST = 1000;

export function isPlayerKey(value: unknown): value is PlayerKey {
  return value === "ron" || value === "mes";
}
