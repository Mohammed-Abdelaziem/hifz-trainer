/**
 * Derived streak with a built-in "freeze": the ledger forgiveness rule.
 *
 * The stored user.currentStreak (src/lib/server/hifz-service computeStreak)
 * is increment-only, so a single missed midnight — a sick day, travel, a
 * Sunday without the phone — wipes a months-long run. Freezing properly
 * would need persistence (spent-shield counters), which this deployment
 * cannot migrate safely (Prisma CLI cannot parse the pooled DATABASE_URL).
 *
 * Instead the DISPLAYED streak is recomputed from the durable activity
 * ledger (review + reading rows, UTC day keys) with one deterministic rule:
 * within a single streak run, the FIRST missed day is bridged. All of the
 * state lives in the ledger, so the rule is idempotent, race-free, and honest.
 *
 * Truncation: pass `windowStartKey` as the earliest day the caller actually
 * fetched; if the run is still alive when the walk reaches that bound, the
 * run may extend further back and the caller should prefer its wider view
 * (the stored counter) — derived output alone would under-count.
 */

export interface DerivedStreak {
  current: number;
  /** True when the current run has already consumed its one bridged miss. */
  graceUsed: boolean;
  /** The run was still alive at the supplied window bound (or true unknown). */
  truncated: boolean;
}

/**
 * days: unique UTC "yyyy-mm-dd" keys of any activity (review or read),
 * sorted ascending. todayKey: the anchor day ("yyyy-mm-dd"). An inactive
 * today does NOT break the run — the day is still open.
 */
export function deriveStreak(
  days: string[],
  todayKey: string,
  windowStartKey?: string
): DerivedStreak {
  const set = new Set(days);
  const sorted = [...set].sort();
  // No explicit bound: the oldest observed activity day acts as one — the
  // caller fetched what it fetched, and anything before it is unknown.
  const windowStart = windowStartKey ?? sorted[0] ?? todayKey;

  const cursor = new Date(`${todayKey}T00:00:00Z`);
  if (!set.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let current = 0;
  let graceUsed = false;

  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (key < windowStart) {
      // Reached the window bottom with the run still alive: anything earlier
      // was not fetched, so the run may extend further back.
      return { current, graceUsed, truncated: current > 0 };
    }
    if (set.has(key)) {
      current += 1;
    } else if (!graceUsed && current > 0) {
      // Freeze: bridge the first miss inside the run.
      graceUsed = true;
    } else {
      // No activity, and either the grace is already spent or the run never
      // started: the second miss terminates the streak deterministically.
      return { current, graceUsed, truncated: false };
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
}
