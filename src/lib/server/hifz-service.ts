import type { Grade, MemoryState, SchedulerKind } from "@/types/quran";
import type { DailyQueue, MemoryCell, QueueItem, StreakInfo } from "@/types/srs";
import { getDb, getDbWithTest, sanitizeUrl } from "@/lib/db";
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

export const DEMO_EMAIL = "demo@hifz.local";

const PAGE_NUMBERS: Record<number, number> = { 1: 1, 112: 604 };

let seedPromise: Promise<void> | null = null;

async function seedVerses(): Promise<void> {
  const db = await getDbWithTest();
  for (const surah of Object.values(FIXTURE_SURAHS)) {
    for (const ayah of surah.ayahs) {
      const safeAudioUrl = sanitizeUrl(ayah.audio_url);
      const createData = {
        verseKey: ayah.verse_key,
        surahId: surah.id,
        ayahNumber: ayah.ayah_number,
        pageNumber: PAGE_NUMBERS[surah.id] ?? 1,
        uthmaniText: ayah.words.map((w) => w.text_uthmani).join(" "),
        translation: ayah.words.map((w) => w.translation).join(" "),
        audioUrl: safeAudioUrl ?? ayah.audio_url,
        timestampsJson: JSON.stringify(ayah.timings),
        wordsJson: JSON.stringify(ayah.words),
        tafsir: ayah.tafsir,
      };
      try {
        await db.verse.upsert({
          where: { verseKey: ayah.verse_key },
          create: createData,
          update: {},
        });
      } catch {
        throw new Error(`Failed to seed verse ${ayah.verse_key}`);
      }
    }
  }
}

export function ensureVersesSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedVerses().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOrCreateUser(email = DEMO_EMAIL) {
  const db = await getDbWithTest();
  await ensureVersesSeeded();
  return db.user.upsert({
    where: { email },
    create: { email },
    update: {},
  });
}

export async function ensureDemoUser(email: string, passwordHash: string) {
  const db = await getDbWithTest();
  await ensureVersesSeeded();
  await db.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
}

function computeStreak(
  user: { currentStreak: number; longestStreak: number; lastActiveDate: Date | null },
  now: Date
): { currentStreak: number; longestStreak: number; lastActiveDate: Date } {
  const today = startOfDay(now);
  const last = user.lastActiveDate ? startOfDay(user.lastActiveDate) : null;
  let streak = user.currentStreak;

  if (!last) {
    streak = 1;
  } else {
    const dayMs = 86_400_000;
    const diff = Math.round((today.getTime() - last.getTime()) / dayMs);
    if (diff === 0) streak = Math.max(1, streak);
    else if (diff === 1) streak += 1;
    else streak = 1;
  }

  return {
    currentStreak: streak,
    longestStreak: Math.max(user.longestStreak, streak),
    lastActiveDate: now,
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
  const db = getDb();
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
    const out = scheduleFsrs(prevFsrs, params.grade, now, user.requestRetention ?? 0.9);
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
  ]);

  const streakFields = computeStreak(user, now);
  await db.user.update({ where: { id: params.userId }, data: streakFields });

  const todayReviewed = await db.reviewLog.count({
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
    },
  };
}

function surahName(surahId: number): string {
  return FIXTURE_SURAHS[surahId]?.name_simple ?? `Surah ${surahId}`;
}

export async function buildMemoryMap(userId: string): Promise<MemoryCell[]> {
  const db = getDb();
  const [verses, surahRows] = await Promise.all([
    db.verse.findMany({
      include: { memoryStates: { where: { userId } } },
      orderBy: [{ surahId: "asc" }, { ayahNumber: "asc" }],
    }),
    db.surah.findMany(),
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
    };
  });
}

export async function buildDailyQueue(userId: string): Promise<DailyQueue> {
  const db = getDb();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [user, states] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    db.userMemoryState.findMany({
      where: { userId, dueDate: { lte: endOfToday } },
      include: { verse: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);
  const toItem = (s: (typeof states)[number]): QueueItem => ({
    verseKey: s.verseKey,
    surahId: s.verse.surahId,
    surahName: surahName(s.verse.surahId),
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

  return {
    sabaq: buckets.SABAQ,
    sabqi: buckets.SABQI,
    manzil: buckets.MANZIL,
    estimatedMinutes: Math.ceil(totalItems * 1.5),
    scheduler: user.scheduler === "fsrs" ? "fsrs" : "sm2",
    requestRetention: user.requestRetention ?? 0.9,
    streak: {
      current: user.currentStreak,
      longest: user.longestStreak,
      dailyTargetCount: user.dailyTargetCount,
      todayReviewed,
    },
  };
}
