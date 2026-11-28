import { getDb } from "@/lib/db";
import { DAY_MS } from "@/lib/constants";
import { utcDayKey, utcDaysAgo } from "@/lib/date";
import { getAchievementSnapshot, buildSurahNameMap } from "@/lib/server/hifz-service";
import { levelForXp, xpFromGradeCounts } from "@/lib/xp";
import { evaluateAchievements } from "@/lib/achievements";
import type { RecapData, ReviewStats } from "@/types/srs";

export const INTERVAL_BUCKETS = ["≤1d", "1–3d", "3–7d", "7–21d", ">21d"] as const;

export function previousWeekOffset(key: string, todayKey: string): number {
  return Math.round(
    (Date.parse(`${todayKey}T00:00:00Z`) - Date.parse(`${key}T00:00:00Z`)) / DAY_MS
  );
}

function isPreviousWeek(key: string, todayKey: string): boolean {
  const offset = previousWeekOffset(key, todayKey);
  return offset >= 7 && offset <= 13;
}

export function buildRecap(
  logs: { createdAt: Date; grade: string; verseKey: string }[],
  now: Date,
  surahNames: Map<number, string>
): RecapData {
  const todayKey = now.toISOString().slice(0, 10);
  const dayAt = (offset: number): string => {
    const d = new Date(`${todayKey}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - offset);
    return d.toISOString().slice(0, 10);
  };
  const weekKeys = new Set<string>();
  for (let i = 0; i < 7; i++) weekKeys.add(dayAt(i));

  let reviewsThisWeek = 0;
  let reviewsLastWeek = 0;
  const perDayThisWeek = new Map<string, number>();
  const gradeCountsThisWeek: Record<string, number> = {};
  const bySurah = new Map<number, number>();

  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    if (weekKeys.has(key)) {
      reviewsThisWeek += 1;
      perDayThisWeek.set(key, (perDayThisWeek.get(key) ?? 0) + 1);
      gradeCountsThisWeek[log.grade] = (gradeCountsThisWeek[log.grade] ?? 0) + 1;
      const surahId = Number.parseInt(log.verseKey.split(":")[0] ?? "", 10);
      if (Number.isInteger(surahId)) bySurah.set(surahId, (bySurah.get(surahId) ?? 0) + 1);
    } else if (isPreviousWeek(key, todayKey)) {
      reviewsLastWeek += 1;
    }
  }

  let bestDay: RecapData["bestDay"] = null;
  for (const [date, count] of perDayThisWeek) {
    if (!bestDay || count > bestDay.count) bestDay = { date, count };
  }

  let topSurah: RecapData["topSurah"] = null;
  for (const [surahId, count] of bySurah) {
    if (!topSurah || count > topSurah.count) {
      topSurah = { surahId, name: surahNames.get(surahId) ?? `Surah ${surahId}`, count };
    }
  }

  return {
    reviewsThisWeek,
    reviewsLastWeek,
    activeDaysThisWeek: perDayThisWeek.size,
    bestDay,
    topSurah,
    xpThisWeek: xpFromGradeCounts(gradeCountsThisWeek),
  };
}

function bucketIndex(intervalDays: number): number {
  if (intervalDays <= 1) return 0;
  if (intervalDays <= 3) return 1;
  if (intervalDays <= 7) return 2;
  if (intervalDays <= 21) return 3;
  return 4;
}

export async function getReviewStats(userId: string): Promise<ReviewStats> {
  const db = await getDb();
  const since = utcDaysAgo(29);

  const [logs, reads, snapshot, gradeRows, surahRows] = await Promise.all([
    db.reviewLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: {
        createdAt: true,
        grade: true,
        verseKey: true,
        reviewDurationMs: true,
        intervalDays: true,
        scheduler: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.readingLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    getAchievementSnapshot(userId),
    db.reviewLog.groupBy({ by: ["grade"], where: { userId }, _count: { _all: true } }),
    db.surah.findMany({ select: { id: true, nameSimple: true } }),
  ]);

  const perDayMap = new Map<string, { count: number; reads: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    perDayMap.set(utcDayKey(d), { count: 0, reads: 0 });
  }

  const grades: Record<string, number> = { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 };
  const sm2Buckets = [0, 0, 0, 0, 0];
  const fsrsBuckets = [0, 0, 0, 0, 0];
  let sm2Total = 0;
  let fsrsTotal = 0;
  let durationSum = 0;
  let recentCount = 0;

  const surahNames = buildSurahNameMap(surahRows);
  const gradeCountsAllTime: Record<string, number> = {};
  for (const row of gradeRows) {
    gradeCountsAllTime[row.grade] = row._count._all;
  }

  for (const log of logs) {
    const key = utcDayKey(log.createdAt);
    if (perDayMap.has(key)) {
      perDayMap.get(key)!.count += 1;
      recentCount += 1;
      durationSum += log.reviewDurationMs;
      grades[log.grade] = (grades[log.grade] ?? 0) + 1;
    }
    if (log.scheduler === "fsrs") {
      fsrsBuckets[bucketIndex(log.intervalDays)]++;
      fsrsTotal++;
    } else {
      sm2Buckets[bucketIndex(log.intervalDays)]++;
      sm2Total++;
    }
  }

  for (const read of reads) {
    const key = utcDayKey(read.createdAt);
    if (perDayMap.has(key)) {
      perDayMap.get(key)!.reads += 1;
    }
  }

  return {
    totalReviews: logs.length,
    totalReads: reads.length,
    activeDays: [...perDayMap.values()].filter((d) => d.count > 0).length,
    readDays: [...perDayMap.values()].filter((d) => d.reads > 0).length,
    avgDurationMs: recentCount > 0 ? Math.round(durationSum / recentCount) : 0,
    grades,
    perDay: [...perDayMap.entries()].map(([date, d]) => ({
      date,
      count: d.count,
      reads: d.reads,
    })),
    schedulerCompare: {
      buckets: [...INTERVAL_BUCKETS],
      sm2: sm2Buckets,
      fsrs: fsrsBuckets,
      totals: { sm2: sm2Total, fsrs: fsrsTotal },
    },
    xp: levelForXp(xpFromGradeCounts(gradeCountsAllTime)),
    recap: buildRecap(logs, new Date(), surahNames),
    achievements: evaluateAchievements(snapshot),
  };
}
