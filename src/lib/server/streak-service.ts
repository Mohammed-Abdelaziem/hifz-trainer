import { getDb } from "@/lib/db";
import { DAY_MS } from "@/lib/constants";
import { utcDayKey, utcDaysAgo, utcStartOfDay } from "@/lib/date";
import { deriveStreak } from "@/lib/streak-grace";

/** How far back the derived (ledger) streak window reaches, in days. */
export const STREAK_ACTIVITY_WINDOW_DAYS = 90;

export function computeStreak(
  user: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: Date | null;
    lastReadDate: Date | null;
  },
  now: Date
): { currentStreak: number; longestStreak: number; lastActiveDate: Date; lastReadDate: Date } {
  const today = utcStartOfDay(now);
  const lastReview = user.lastActiveDate ? utcStartOfDay(user.lastActiveDate) : null;
  const lastRead = user.lastReadDate ? utcStartOfDay(user.lastReadDate) : null;
  const last =
    lastReview && lastRead
      ? new Date(Math.max(lastReview.getTime(), lastRead.getTime()))
      : (lastReview ?? lastRead);
  let streak = user.currentStreak;

  if (!last) {
    streak = 1;
  } else {
    const diff = Math.round((today.getTime() - last.getTime()) / DAY_MS);
    if (diff === 0) streak = Math.max(1, streak);
    else if (diff === 1) streak += 1;
    else streak = 1;
  }

  return {
    currentStreak: streak,
    longestStreak: Math.max(user.longestStreak, streak),
    lastActiveDate: now,
    lastReadDate: now,
  };
}

/**
 * UTC day keys of any activity (review or read) within the window, used for
 * the ledger-derived streak. Two `select: { createdAt }`-only queries over
 * indexed columns; the window is short enough (90d) that the row count stays
 * in the low hundreds even for heavy users.
 */
export async function getActivityDayKeys(
  userId: string,
  windowDays: number = STREAK_ACTIVITY_WINDOW_DAYS
): Promise<string[]> {
  const db = await getDb();
  const since = utcDaysAgo(windowDays - 1);
  const [reviewRows, readRows] = await Promise.all([
    db.reviewLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.readingLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);
  const days = new Set<string>();
  for (const r of reviewRows) days.add(utcDayKey(r.createdAt));
  for (const r of readRows) days.add(utcDayKey(r.createdAt));
  return [...days].sort();
}

/**
 * The dashboard's streak display: derived from the ledger with the freeze
 * rule (src/lib/streak-grace — a first missed day inside a run is bridged),
 * falling back to the stored values when the sourced window truncates the
 * run (a streak longer than the window may reach back further than we know).
 * Fetches the user row itself so callers can race it in a Promise.all.
 */
export async function deriveDisplayedStreak(userId: string): Promise<{
  user: { id: string; dailyTargetCount: number; scheduler: string; requestRetention: number };
  current: number;
  longest: number;
  graceUsed: boolean;
}> {
  const db = await getDb();
  const now = new Date();
  const since = utcDaysAgo(STREAK_ACTIVITY_WINDOW_DAYS - 1, now);
  const [user, days] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    getActivityDayKeys(userId),
  ]);
  const derived = deriveStreak(days, utcDayKey(now), utcDayKey(since));
  if (derived.truncated) {
    return {
      user,
      current: Math.max(user.currentStreak, derived.current),
      longest: Math.max(user.longestStreak, derived.current),
      graceUsed: false,
    };
  }
  return {
    user,
    current: derived.current,
    longest: Math.max(user.longestStreak, derived.current),
    graceUsed: derived.graceUsed,
  };
}

/**
 * Everything the achievement badges need, in one round trip. Verses known
 * come from one column-only scan of KNOWN rows (<=6,236 small rows); per-surah
 * totals from a verse-table groupBy; streaks reuse the ledger derivation.
 */
export async function getAchievementSnapshot(userId: string): Promise<{
  totalReviews: number;
  versesKnown: number;
  surahsKnown: number;
  streakCurrent: number;
  streakLongest: number;
}> {
  const db = await getDb();
  const [streakData, totalReviews, knownRows, surahTotals] = await Promise.all([
    deriveDisplayedStreak(userId),
    db.reviewLog.count({ where: { userId } }),
    db.userMemoryState.findMany({
      where: { userId, state: "KNOWN" },
      select: { verseKey: true },
    }),
    db.verse.groupBy({ by: ["surahId"], _count: { _all: true } }),
  ]);

  const knownBySurah = new Map<number, number>();
  for (const row of knownRows) {
    const surahId = Number.parseInt(row.verseKey.split(":")[0] ?? "", 10);
    if (Number.isInteger(surahId)) {
      knownBySurah.set(surahId, (knownBySurah.get(surahId) ?? 0) + 1);
    }
  }
  let surahsKnown = 0;
  for (const totals of surahTotals) {
    const total = totals._count._all;
    if (total > 0 && (knownBySurah.get(totals.surahId) ?? 0) >= total) {
      surahsKnown += 1;
    }
  }

  return {
    totalReviews,
    versesKnown: knownRows.length,
    surahsKnown,
    streakCurrent: streakData.current,
    streakLongest: streakData.longest,
  };
}
