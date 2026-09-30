import type { Grade, MemoryState, SchedulerKind } from "@/types/quran";
import type { DailyQueue, MemoryCell, QueueItem, StreakInfo } from "@/types/srs";
import { getDb } from "@/lib/db";
import { DAY_MS, DEFAULT_RETENTION } from "@/lib/constants";
import { FIXTURE_SURAHS } from "@/lib/quran/fixtures";
import {
  GRADE_QUALITY,
  NEW_MEMORY_STATE,
  schedule,
  type Sm2Input,
} from "@/lib/srs/sm2";
import { scheduleFsrs, type FsrsInput } from "@/lib/srs/fsrs";
import { applyHifzRouting } from "@/lib/srs/routing";
import { stabilityScore } from "@/lib/srs/stability";

/** Upper bound on items returned by buildDailyQueue for a single user. */
const MAX_QUEUE_ITEMS = 500;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeStreak(
  user: { currentStreak: number; longestStreak: number; lastActiveDate: Date | null; lastReadDate: Date | null },
  now: Date
): { currentStreak: number; longestStreak: number; lastActiveDate: Date; lastReadDate: Date } {
  const today = startOfDay(now);
  const lastReview = user.lastActiveDate ? startOfDay(user.lastActiveDate) : null;
  const lastRead = user.lastReadDate ? startOfDay(user.lastReadDate) : null;
  const last = lastReview && lastRead
    ? new Date(Math.max(lastReview.getTime(), lastRead.getTime()))
    : lastReview ?? lastRead;
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

export async function recordReview(params: {
  userId: string;
  verseKey: string;
  grade: Grade;
  durationMs?: number;
}): Promise<{ result: ReviewResult; streak: StreakInfo }> {
  const db = await getDb();
  const now = new Date();

  const user = await db.user.findUniqueOrThrow({ where: { id: params.userId } });
  const scheduler: SchedulerKind = user.scheduler === "fsrs" ? "fsrs" : "sm2";

  const existing = await db.userMemoryState.findUnique({
    where: { userId_verseKey: { userId: params.userId, verseKey: params.verseKey } },
  });

  const prevState = (existing?.state as MemoryState) ?? "SABAQ";
  const lapsesNow =
    params.grade === "AGAIN" && prevState !== "SABAQ"
      ? (existing?.lapses ?? 0) + 1
      : existing?.lapses ?? 0;

  let state: MemoryState;
  let intervalDays: number;
  let easeFactor = existing?.easeFactor ?? 2.5;
  let repetitionCount: number;
  let difficulty: number | null = null;
  let stability: number | null = null;
  let dueDate: Date;

  if (scheduler === "fsrs") {
    const prevFsrs: FsrsInput = {
      difficulty: existing?.difficulty ?? 0,
      stability: existing?.stability ?? 0,
      repetitionCount: existing?.repetitionCount ?? 0,
      lapses: existing?.lapses ?? 0,
    };
    const out = scheduleFsrs(prevFsrs, params.grade, now, user.requestRetention ?? DEFAULT_RETENTION);
    intervalDays = out.intervalDays;
    dueDate = out.dueDate;
    difficulty = out.difficulty;
    stability = out.stability;
    repetitionCount = prevFsrs.repetitionCount + 1;
    state = applyHifzRouting(prevState, params.grade, intervalDays);
  } else {
    const prev: Sm2Input = existing
      ? {
          easeFactor: existing.easeFactor,
          intervalDays: existing.intervalDays,
          repetitionCount: existing.repetitionCount,
          state: prevState,
        }
      : NEW_MEMORY_STATE;
    const outcome = schedule(prev, params.grade, now);
    state = outcome.state;
    intervalDays = outcome.intervalDays;
    easeFactor = outcome.easeFactor;
    repetitionCount = outcome.repetitionCount;
    dueDate = outcome.dueDate;
  }

  const streakFields = computeStreak(user, now);

  // The streak update is part of the same transaction: previously it ran as a
  // third separate write, so a failure after the commit left the review logged
  // with no streak credit and no way to reconcile.
  await db.$transaction([
    db.userMemoryState.upsert({
      where: { userId_verseKey: { userId: params.userId, verseKey: params.verseKey } },
      create: {
        userId: params.userId,
        verseKey: params.verseKey,
        state,
        intervalDays,
        easeFactor,
        repetitionCount,
        lapses: lapsesNow,
        difficulty,
        stability,
        dueDate,
        lastReviewedAt: now,
      },
      update: {
        state,
        intervalDays,
        easeFactor,
        repetitionCount,
        lapses: lapsesNow,
        difficulty,
        stability,
        dueDate,
        lastReviewedAt: now,
      },
    }),
    db.reviewLog.create({
      data: {
        userId: params.userId,
        verseKey: params.verseKey,
        grade: params.grade,
        quality: GRADE_QUALITY[params.grade],
        intervalDays,
        easeFactorAfter: easeFactor,
        difficultyAfter: difficulty,
        stabilityAfter: stability,
        scheduler,
        reviewDurationMs: Math.round(params.durationMs ?? 0),
      },
    }),
    db.user.update({ where: { id: params.userId }, data: streakFields }),
  ]);

  const todayReviewed = await db.reviewLog.count({
    where: {
      userId: params.userId,
      createdAt: { gte: startOfDay(now) },
    },
  });

  const todayRead = await db.readingLog.count({
    where: {
      userId: params.userId,
      createdAt: { gte: startOfDay(now) },
    },
  });

  return {
    result: {
      verseKey: params.verseKey,
      scheduler,
      state,
      intervalDays,
      easeFactor,
      difficulty: difficulty ?? undefined,
      stability: stability ?? undefined,
      repetitionCount,
    },
    streak: {
      current: streakFields.currentStreak,
      longest: streakFields.longestStreak,
      dailyTargetCount: user.dailyTargetCount,
      todayReviewed,
      todayRead,
    },
  };
}

/**
 * Builds a surahId -> name map, preferring the Surah table and falling back to
 * the two-surah fixture for a database that has not been synced yet.
 */
function buildSurahNameMap(
  rows: { id: number; nameSimple: string }[]
): Map<number, string> {
  const names = new Map<number, string>();
  for (const row of rows) names.set(row.id, row.nameSimple);
  for (const s of Object.values(FIXTURE_SURAHS)) {
    if (!names.has(s.id)) names.set(s.id, s.name_simple);
  }
  return names;
}

/**
 * Inserts verses into the user's Sabaq (new-memorization) bucket.
 *
 * This is the intake step the app was missing: rows only ever appeared as a
 * side effect of grading a verse in the reader, so a new account had a
 * permanently empty queue and an empty state that congratulated them on it.
 */
export async function addToSabaq(params: {
  userId: string;
  verseKeys: string[];
}): Promise<{ added: number; skipped: number }> {
  const db = await getDb();
  const now = new Date();

  // Only verses that exist can be added, and the shape is validated here as
  // well as at the route edge.
  const keys = [...new Set(params.verseKeys)].filter(
    (k) => /^\d{1,3}:\d{1,3}$/.test(k)
  );
  if (keys.length === 0) return { added: 0, skipped: 0 };

  const existingVerses = await db.verse.findMany({
    where: { verseKey: { in: keys } },
    select: { verseKey: true },
  });
  const valid = existingVerses.map((v) => v.verseKey);
  if (valid.length === 0) return { added: 0, skipped: keys.length };

  // Never re-add something the user already has state for; that would reset a
  // verse they have partly memorized back to Sabaq.
  const alreadyTracked = await db.userMemoryState.findMany({
    where: { userId: params.userId, verseKey: { in: valid } },
    select: { verseKey: true },
  });
  const tracked = new Set(alreadyTracked.map((s) => s.verseKey));
  const toAdd = valid.filter((k) => !tracked.has(k));

  if (toAdd.length > 0) {
    await db.userMemoryState.createMany({
      data: toAdd.map((verseKey) => ({
        userId: params.userId,
        verseKey,
        state: "SABAQ",
        dueDate: now,
      })),
      skipDuplicates: true,
    });
  }

  return { added: toAdd.length, skipped: keys.length - toAdd.length };
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
        state: "SABAQ",
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

export async function buildMemoryMap(userId: string): Promise<MemoryCell[]> {
  const db = await getDb();
  const [verses, surahRows] = await Promise.all([
    // Only these columns are mapped below. Without `select` this pulls the
    // uthmani text, translation, timestamps and the multi-KB wordsJson blob
    // for all ~6,236 verses on every request, and discards all of it.
    db.verse.findMany({
      select: {
        verseKey: true,
        surahId: true,
        ayahNumber: true,
        pageNumber: true,
        memoryStates: {
          where: { userId },
          select: { state: true, intervalDays: true, dueDate: true, readCount: true },
        },
      },
      orderBy: [{ surahId: "asc" }, { ayahNumber: "asc" }],
    }),
    db.surah.findMany({ select: { id: true, nameSimple: true } }),
  ]);
  const surahNames = new Map<number, string>();
  for (const s of surahRows) surahNames.set(s.id, s.nameSimple);
  for (const s of Object.values(FIXTURE_SURAHS)) {
    if (!surahNames.has(s.id)) surahNames.set(s.id, s.name_simple);
  }
  const now = new Date();
  return verses.map((v) => {
    const ms = v.memoryStates[0] ?? null;
    return {
      verseKey: v.verseKey,
      surahId: v.surahId,
      surahName: surahNames.get(v.surahId) ?? `Surah ${v.surahId}`,
      pageNumber: v.pageNumber,
      ayahNumber: v.ayahNumber,
      state: (ms?.state as MemoryCell["state"]) ?? null,
      intervalDays: ms?.intervalDays ?? 0,
      dueAt: ms?.dueDate.toISOString() ?? null,
      stability: stabilityScore(
        (ms?.state as MemoryCell["state"]) ?? null,
        ms?.intervalDays ?? 0,
        ms?.dueDate ?? null,
        now
      ),
      readCount: ms?.readCount ?? 0,
    };
  });
}

export async function buildDailyQueue(userId: string): Promise<DailyQueue> {
  const db = await getDb();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [user, states, surahRows] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    // `include: { verse: true }` fetched the whole Verse row (text, translation,
    // wordsJson) for every due verse. The mapper below needs four fields, and
    // the due set grows with the corpus, so the result set is also capped.
    db.userMemoryState.findMany({
      where: { userId, dueDate: { lte: endOfToday } },
      select: {
        verseKey: true,
        state: true,
        intervalDays: true,
        dueDate: true,
        verse: { select: { surahId: true, ayahNumber: true, pageNumber: true } },
      },
      orderBy: { dueDate: "asc" },
      take: MAX_QUEUE_ITEMS,
    }),
    // Surah names live in the Surah table, not in the two-surah fixture, so
    // reading them here is what stops the queue showing "Surah 47".
    db.surah.findMany({ select: { id: true, nameSimple: true } }),
  ]);
  const names = buildSurahNameMap(surahRows);
  const toItem = (s: (typeof states)[number]): QueueItem => ({
    verseKey: s.verseKey,
    surahId: s.verse.surahId,
    surahName: names.get(s.verse.surahId) ?? `Surah ${s.verse.surahId}`,
    ayahNumber: s.verse.ayahNumber,
    pageNumber: s.verse.pageNumber,
    dueAt: s.dueDate.toISOString(),
    intervalDays: s.intervalDays,
  });

  const buckets: Record<string, QueueItem[]> = { SABAQ: [], SABQI: [], MANZIL: [] };
  for (const s of states) {
    const bucket = buckets[s.state] ?? buckets.SABQI;
    bucket.push(toItem(s));
  }

  const totalItems =
    buckets.SABAQ.length + buckets.SABQI.length + buckets.MANZIL.length;

  const todayReviewed = await db.reviewLog.count({
    where: { userId, createdAt: { gte: startOfDay(new Date()) } },
  });

  const todayRead = await db.readingLog.count({
    where: { userId, createdAt: { gte: startOfDay(new Date()) } },
  });

  return {
    sabaq: buckets.SABAQ,
    sabqi: buckets.SABQI,
    manzil: buckets.MANZIL,
    estimatedMinutes: Math.ceil(totalItems * 1.5),
    scheduler: user.scheduler === "fsrs" ? "fsrs" : "sm2",
    requestRetention: user.requestRetention ?? DEFAULT_RETENTION,
    streak: {
      current: user.currentStreak,
      longest: user.longestStreak,
      dailyTargetCount: user.dailyTargetCount,
      todayReviewed,
      todayRead,
    },
  };
}
