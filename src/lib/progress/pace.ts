import { DAY_MS } from "@/lib/constants";

export interface PaceInputs {
  memorized: number;
  total: number;
  /** Millisecond timestamp of the user's target date, or null when unset. */
  targetDateMs?: number | null;
  nowMs?: number;
}

export interface PaceStats {
  memorized: number;
  total: number;
  remaining: number;
  /** Whole days between today and the target date; null when no date is set. */
  daysLeft: number | null;
  /** Verses per day needed to finish on target; null when not computable. */
  perDay: number | null;
  perWeek: number | null;
  /** True when the target date lies at or before today. */
  overdue: boolean;
}

/**
 * Pure pace math for the memorization planner. Rounding policy: ceil for the
 * daily rate (a fractional verse a day is meaningless — the plan must never
 * end one day late because of rounding down), floor for daysLeft (a partial
 * day still counts as a day you can study in).
 */
export function computePace({
  memorized,
  total,
  targetDateMs = null,
  nowMs = Date.now(),
}: PaceInputs): PaceStats {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const safeMemorized =
    Number.isFinite(memorized) && memorized > 0 ? Math.floor(memorized) : 0;
  const remaining = Math.max(0, safeTotal - safeMemorized);
  const done = remaining === 0;

  if (typeof targetDateMs !== "number" || !Number.isFinite(targetDateMs) || done) {
    return {
      memorized: safeMemorized,
      total: safeTotal,
      remaining,
      daysLeft: null,
      perDay: null,
      perWeek: null,
      overdue: false,
    };
  }

  const daysLeft = Math.floor((targetDateMs - nowMs) / DAY_MS);
  const overdue = daysLeft <= 0;
  // Ceil: a fractional verse per day is meaningless, and rounding down could
  // make the plan finish a day late on exact divisibility boundaries.
  const perDay = overdue || remaining === 0 ? null : Math.ceil(remaining / daysLeft);
  return {
    memorized: safeMemorized,
    total: safeTotal,
    remaining,
    daysLeft,
    perDay,
    perWeek: perDay !== null ? perDay * 7 : null,
    overdue,
  };
}
