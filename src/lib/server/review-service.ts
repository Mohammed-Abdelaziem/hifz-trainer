import { Prisma } from "../../../generated/prisma";
import type { Grade, MemoryState, SchedulerKind } from "@/types/quran";
import type { StreakInfo } from "@/types/srs";
import { getDb } from "@/lib/db";
import {
  DAY_MS,
  DEFAULT_RETENTION,
  KNOWN_REVISION_INTERVAL_DAYS,
  KNOWN_REVISION_MAX_INTERVAL_DAYS,
} from "@/lib/constants";
import { utcEndOfDay, utcStartOfDay } from "@/lib/date";
import { GRADE_QUALITY } from "@/lib/srs/sm2";
import { scheduleReview } from "@/lib/srs";
import { computeStreak } from "./streak-service";

const SERIALIZATION_RETRIES = 3;

export interface ReviewResult {
  verseKey: string;
  scheduler: SchedulerKind;
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  difficulty?: number;
  stability?: number;
  repetitionCount: number;
}

function isSerializationFailure(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2034"
  );
}

export async function recordReview(params: {
  userId: string;
  verseKey: string;
  grade: Grade;
  durationMs?: number;
}): Promise<{ result: ReviewResult; streak: StreakInfo }> {
  const db = await getDb();

  for (let attempt = 0; attempt < SERIALIZATION_RETRIES; attempt++) {
    const now = new Date();
    try {
      return await db.$transaction(
        async (tx) => {
          const user = await tx.user.findUniqueOrThrow({ where: { id: params.userId } });
          const scheduler: SchedulerKind = user.scheduler === "fsrs" ? "fsrs" : "sm2";

          const existing = await tx.userMemoryState.findUnique({
            where: { userId_verseKey: { userId: params.userId, verseKey: params.verseKey } },
          });

          const outcome = scheduleReview(
            scheduler,
            existing && existing.state !== "READ"
              ? {
                  state: existing.state as MemoryState,
                  intervalDays: existing.intervalDays,
                  easeFactor: existing.easeFactor,
                  repetitionCount: existing.repetitionCount,
                  lapses: existing.lapses,
                  difficulty: existing.difficulty,
                  stability: existing.stability,
                }
              : null,
            params.grade,
            { now, requestRetention: user.requestRetention ?? DEFAULT_RETENTION }
          );

          const streakFields = computeStreak(user, now);

          await tx.userMemoryState.upsert({
            where: { userId_verseKey: { userId: params.userId, verseKey: params.verseKey } },
            create: {
              userId: params.userId,
              verseKey: params.verseKey,
              state: outcome.state,
              intervalDays: outcome.intervalDays,
              easeFactor: outcome.easeFactor,
              repetitionCount: outcome.repetitionCount,
              lapses: outcome.lapses,
              difficulty: outcome.difficulty,
              stability: outcome.stability,
              dueDate: outcome.dueDate,
              lastReviewedAt: now,
            },
            update: {
              state: outcome.state,
              intervalDays: outcome.intervalDays,
              easeFactor: outcome.easeFactor,
              repetitionCount: outcome.repetitionCount,
              lapses: outcome.lapses,
              difficulty: outcome.difficulty,
              stability: outcome.stability,
              dueDate: outcome.dueDate,
              lastReviewedAt: now,
            },
          });

          await tx.reviewLog.create({
            data: {
              userId: params.userId,
              verseKey: params.verseKey,
              grade: params.grade,
              quality: GRADE_QUALITY[params.grade],
              intervalDays: outcome.intervalDays,
              easeFactorAfter: outcome.easeFactor,
              difficultyAfter: outcome.difficulty,
              stabilityAfter: outcome.stability,
              scheduler,
              reviewDurationMs: Math.round(params.durationMs ?? 0),
            },
          });

          await tx.user.update({ where: { id: params.userId }, data: streakFields });

          const todayStart = utcStartOfDay(now);
          const [todayReviewed, todayRead] = await Promise.all([
            tx.reviewLog.count({
              where: { userId: params.userId, createdAt: { gte: todayStart } },
            }),
            tx.readingLog.count({
              where: { userId: params.userId, createdAt: { gte: todayStart } },
            }),
          ]);

          return {
            result: {
              verseKey: params.verseKey,
              scheduler,
              state: outcome.state,
              intervalDays: outcome.intervalDays,
              easeFactor: outcome.easeFactor,
              difficulty: outcome.difficulty ?? undefined,
              stability: outcome.stability ?? undefined,
              repetitionCount: outcome.repetitionCount,
            },
            streak: {
              current: streakFields.currentStreak,
              longest: streakFields.longestStreak,
              dailyTargetCount: user.dailyTargetCount,
              todayReviewed,
              todayRead,
            },
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (err) {
      if (isSerializationFailure(err) && attempt < SERIALIZATION_RETRIES - 1) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to commit review after serialization retries");
}

export async function recordReading(params: {
  userId: string;
  verseKey: string;
  durationMs?: number;
}): Promise<void> {
  const db = await getDb();
  const now = new Date();

  await db.$transaction([
    db.readingLog.create({
      data: {
        userId: params.userId,
        verseKey: params.verseKey,
        durationMs: Math.round(params.durationMs ?? 0),
      },
    }),
    db.userMemoryState.upsert({
      where: { userId_verseKey: { userId: params.userId, verseKey: params.verseKey } },
      create: {
        userId: params.userId,
        verseKey: params.verseKey,
        // Passive reading uses "READ" so it tracks readCount without
        // enrolling untracked verses into the active daily SABAQ queue.
        state: "READ",
        lastReadAt: now,
        readCount: 1,
      },
      update: {
        lastReadAt: now,
        readCount: { increment: 1 },
      },
    }),
    db.user.update({
      where: { id: params.userId },
      data: { lastReadDate: now },
    }),
  ]);
}

/**
 * Records a periodic revision of KNOWN verses (either for a whole surah or
 * explicit verse keys), advancing their dueDate in a single batched SQL
 * statement and logging ReviewLog entries so revision is tracked in stats,
 * XP, and streaks.
 */
export async function recordKnownRevision(params: {
  userId: string;
  surahId?: number;
  verseKeys?: string[];
}): Promise<{ revised: number; nextDueAt: string | null; streak: StreakInfo }> {
  const db = await getDb();
  const now = new Date();
  const endOfToday = utcEndOfDay(now);

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: params.userId } });
    const scheduler: SchedulerKind = user.scheduler === "fsrs" ? "fsrs" : "sm2";

    const whereClause =
      params.verseKeys && params.verseKeys.length > 0
        ? { userId: params.userId, state: "KNOWN", verseKey: { in: params.verseKeys } }
        : params.surahId
          ? { userId: params.userId, state: "KNOWN", verse: { surahId: params.surahId } }
          : { userId: params.userId, state: "KNOWN", dueDate: { lte: endOfToday } };

    const candidates = await tx.userMemoryState.findMany({
      where: whereClause,
      select: {
        id: true,
        verseKey: true,
        intervalDays: true,
        easeFactor: true,
        repetitionCount: true,
        difficulty: true,
        stability: true,
        dueDate: true,
      },
    });

    const dueOnly = candidates.filter((c) => c.dueDate <= endOfToday);
    const targets = dueOnly.length > 0 ? dueOnly : candidates;

    let earliestNext: Date | null = null;
    if (targets.length > 0) {
      const updates: Array<{
        id: string;
        nextInterval: number;
        nextRepCount: number;
        nextDue: Date;
      }> = [];
      const reviewLogs = [];

      for (const row of targets) {
        const base = row.intervalDays > 0 ? row.intervalDays : KNOWN_REVISION_INTERVAL_DAYS;
        const nextInterval = Math.min(
          KNOWN_REVISION_MAX_INTERVAL_DAYS,
          Math.max(KNOWN_REVISION_INTERVAL_DAYS, Math.round(base * 1.5))
        );
        const nextDue = new Date(now.getTime() + nextInterval * DAY_MS);
        if (!earliestNext || nextDue < earliestNext) earliestNext = nextDue;

        updates.push({
          id: row.id,
          nextInterval,
          nextRepCount: row.repetitionCount + 1,
          nextDue,
        });

        reviewLogs.push({
          userId: params.userId,
          verseKey: row.verseKey,
          grade: "GOOD",
          quality: GRADE_QUALITY.GOOD,
          intervalDays: nextInterval,
          easeFactorAfter: row.easeFactor,
          difficultyAfter: row.difficulty,
          stabilityAfter: row.stability,
          scheduler,
          reviewDurationMs: 0,
        });
      }

      // Single batched UPDATE instead of N sequential per-row updates inside
      // the interactive transaction (prevents 5s tx timeout on large surahs).
      if (typeof tx.$executeRaw === "function") {
        const valueRows = updates.map(
          (u) =>
            Prisma.sql`(${u.id}::text, ${u.nextInterval}::double precision, ${u.nextRepCount}::integer, ${u.nextDue}::timestamptz)`
        );
        await tx.$executeRaw`
          UPDATE "UserMemoryState" AS m
          SET
            "intervalDays" = v.interval_days,
            "repetitionCount" = v.rep_count,
            "dueDate" = v.due_date,
            "lastReviewedAt" = ${now}
          FROM (VALUES ${Prisma.join(valueRows)}) AS v(id, interval_days, rep_count, due_date)
          WHERE m.id = v.id AND m."userId" = ${params.userId}
        `;
      } else {
        await Promise.all(
          updates.map((u) =>
            tx.userMemoryState.update({
              where: { id: u.id },
              data: {
                intervalDays: u.nextInterval,
                repetitionCount: u.nextRepCount,
                dueDate: u.nextDue,
                lastReviewedAt: now,
              },
            })
          )
        );
      }

      await tx.reviewLog.createMany({ data: reviewLogs });
      await tx.user.update({ where: { id: params.userId }, data: computeStreak(user, now) });
    }

    const todayStart = utcStartOfDay(now);
    const [updatedUser, todayReviewed, todayRead] = await Promise.all([
      tx.user.findUniqueOrThrow({ where: { id: params.userId } }),
      tx.reviewLog.count({ where: { userId: params.userId, createdAt: { gte: todayStart } } }),
      tx.readingLog.count({ where: { userId: params.userId, createdAt: { gte: todayStart } } }),
    ]);

    return {
      revised: targets.length,
      nextDueAt: earliestNext ? earliestNext.toISOString() : null,
      streak: {
        current: updatedUser.currentStreak,
        longest: updatedUser.longestStreak,
        dailyTargetCount: updatedUser.dailyTargetCount,
        todayReviewed,
        todayRead,
      },
    };
  });
}
