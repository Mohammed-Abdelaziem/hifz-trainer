/**
 * XP economy for review grades. Fully derived from the ReviewLog ledger —
 * no schema change, idempotent, and self-healing if a row is imported late:
 * today's totals are always recomputed from the durable log rows, never
 * accumulated in a mutable counter.
 *
 * Weights are gentle by design: an AGAIN session still moves the needle so a
 * hard day never feels like a zero, but consistent GOOD/EASY progress visits
 * clear the gap.
 */
export const XP_PER_GRADE: Record<string, number> = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 4,
  EASY: 6,
};

export interface XpLevel {
  /** 1-based level; L1 starts at 0 XP. */
  level: number;
  /** XP accumulated inside the current level. */
  intoLevel: number;
  /** XP still needed to reach the next level. */
  toNextLevel: number;
  /** Cumulative XP. */
  totalXp: number;
}

/**
 * Entering level n+1 costs 25·n² XP: L2 at 25, L3 at 100, L4 at 225,
 * L5 at 400 — quadratic so upgrades keep arriving but late levels still
 * feel earned for a multi-year hifz journey. `xpForLevel(n)` yields the
 * cumulative XP that starts level n.
 */
export function xpForLevel(level: number): number {
  return 25 * (level - 1) * (level - 1);
}

export function levelForXp(totalXp: number): XpLevel {
  const safe = Math.max(0, Math.floor(totalXp));
  const level = Math.max(1, Math.floor(Math.sqrt(safe / 25)) + 1);
  const threshold = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    intoLevel: safe - threshold,
    toNextLevel: next - safe,
    totalXp: safe,
  };
}

/** XP earned from per-grade counts (any shape; unknown grades score 0). */
export function xpFromGradeCounts(counts: Record<string, number>): number {
  let total = 0;
  for (const [grade, count] of Object.entries(counts)) {
    total += (XP_PER_GRADE[grade] ?? 0) * count;
  }
  return total;
}
