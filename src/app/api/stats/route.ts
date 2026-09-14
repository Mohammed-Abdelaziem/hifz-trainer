import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/server/auth";
import { DAY_MS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const INTERVAL_BUCKETS = ["≤1d", "1–3d", "3–7d", "7–21d", ">21d"] as const;

export interface ReviewStats {
  totalReviews: number;
  totalReads: number;
  activeDays: number;
  readDays: number;
  avgDurationMs: number;
  grades: Record<string, number>;
  perDay: { date: string; count: number; reads: number }[];
  schedulerCompare: {
    buckets: string[];
    sm2: number[];
    fsrs: number[];
    totals: { sm2: number; fsrs: number };
  };
}

function bucketIndex(intervalDays: number): number {
  if (intervalDays <= 1) return 0;
  if (intervalDays <= 3) return 1;
  if (intervalDays <= 7) return 2;
  if (intervalDays <= 21) return 3;
  return 4;
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const db = await getDb();
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const [logs, reads] = await Promise.all([
      db.reviewLog.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 30 * DAY_MS) },
        },
        select: {
          createdAt: true,
          grade: true,
          reviewDurationMs: true,
          intervalDays: true,
          scheduler: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      db.readingLog.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 30 * DAY_MS) },
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const perDayMap = new Map<string, { count: number; reads: number }>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      perDayMap.set(d.toISOString().slice(0, 10), { count: 0, reads: 0 });
    }

    const grades: Record<string, number> = { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 };
    const sm2Buckets = [0, 0, 0, 0, 0];
    const fsrsBuckets = [0, 0, 0, 0, 0];
    let sm2Total = 0;
    let fsrsTotal = 0;
    let durationSum = 0;
    let recentCount = 0;

    for (const log of logs) {
      const key = log.createdAt.toISOString().slice(0, 10);
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
      const key = read.createdAt.toISOString().slice(0, 10);
      if (perDayMap.has(key)) {
        perDayMap.get(key)!.reads += 1;
      }
    }

    const stats: ReviewStats = {
      totalReviews: logs.length,
      totalReads: reads.length,
      activeDays: [...perDayMap.values()].filter((d) => d.count > 0).length,
      readDays: [...perDayMap.values()].filter((d) => d.reads > 0).length,
      avgDurationMs: recentCount > 0 ? Math.round(durationSum / recentCount) : 0,
      grades,
      perDay: [...perDayMap.entries()].map(([date, d]) => ({ date, count: d.count, reads: d.reads })),
      schedulerCompare: {
        buckets: [...INTERVAL_BUCKETS],
        sm2: sm2Buckets,
        fsrs: fsrsBuckets,
        totals: { sm2: sm2Total, fsrs: fsrsTotal },
      },
    };

    return Response.json(stats);
  } catch (err) {
    console.error("[/api/stats]", err);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
