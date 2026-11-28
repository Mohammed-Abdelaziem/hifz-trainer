import type { MemoryState } from "@/types/quran";
import type {
  DailyQueue,
  DueForecast,
  MemoryCell,
  PageProgress,
  QueueItem,
  SurahProgress,
  SurahVerseState,
} from "@/types/srs";
import { getDb } from "@/lib/db";
import {
  DAY_MS,
  DEFAULT_RETENTION,
  KNOWN_REVISION_INTERVAL_DAYS,
} from "@/lib/constants";
import { utcEndOfDay, utcStartOfDay } from "@/lib/date";
import { stabilityScore } from "@/lib/srs/stability";
import { buildSurahNameMap } from "./corpus-seeder";
import { deriveDisplayedStreak } from "./streak-service";

/** Upper bound on items returned by buildDailyQueue for a single user. */
const MAX_QUEUE_ITEMS = 500;

export async function getSurahProgress(
  userId: string,
  surahId: number
): Promise<SurahProgress> {
  const db = await getDb();
  const [states, verses] = await Promise.all([
    db.userMemoryState.findMany({
      where: { userId, verse: { surahId } },
      select: { state: true, verse: { select: { pageNumber: true } } },
    }),
    db.verse.findMany({ where: { surahId }, select: { pageNumber: true } }),
  ]);

  const progress: SurahProgress = {
    total: verses.length,
    sabaq: 0,
    sabqi: 0,
    manzil: 0,
    known: 0,
  };
  for (const s of states) {
    if (s.state === "SABAQ") progress.sabaq += 1;
    else if (s.state === "SABQI") progress.sabqi += 1;
    else if (s.state === "MANZIL") progress.manzil += 1;
    else if (s.state === "KNOWN") progress.known += 1;
  }

  const pageTotals = new Map<number, number>();
  for (const v of verses) {
    pageTotals.set(v.pageNumber, (pageTotals.get(v.pageNumber) ?? 0) + 1);
  }
  const byPage = new Map<number, PageProgress>();
  for (const [page, count] of pageTotals) {
    byPage.set(page, { page, total: count, known: 0, learning: 0 });
  }
  for (const s of states) {
    const page = s.verse?.pageNumber;
    if (page === null || page === undefined) continue;
    const entry = byPage.get(page);
    if (!entry) continue;
    if (s.state === "KNOWN") entry.known += 1;
    else if (s.state !== "SABAQ") entry.learning += 1;
  }
  progress.pages = [...byPage.values()].sort((a, b) => a.page - b.page);
  return progress;
}

export async function getSurahVerseStates(
  userId: string,
  surahId: number
): Promise<Record<string, SurahVerseState>> {
  const db = await getDb();
  const rows = await db.userMemoryState.findMany({
    where: { userId, verse: { surahId } },
    select: {
      verseKey: true,
      state: true,
      intervalDays: true,
      easeFactor: true,
      repetitionCount: true,
      lapses: true,
      difficulty: true,
      stability: true,
    },
  });
  const map: Record<string, SurahVerseState> = {};
  for (const r of rows) {
    if (r.state === "READ") continue;
    map[r.verseKey] = {
      state: r.state as MemoryState,
      intervalDays: r.intervalDays,
      easeFactor: r.easeFactor,
      repetitionCount: r.repetitionCount,
      lapses: r.lapses,
      difficulty: r.difficulty,
      stability: r.stability,
    };
  }
  return map;
}

export async function buildMemoryMap(userId: string): Promise<MemoryCell[]> {
  const db = await getDb();
  const [verses, surahRows] = await Promise.all([
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
  const surahNames = buildSurahNameMap(surahRows);
  const now = new Date();
  return verses.map((v) => {
    const ms = v.memoryStates[0] ?? null;
    const hifzState: MemoryCell["state"] =
      ms && ms.state !== "READ" ? (ms.state as MemoryCell["state"]) : null;
    return {
      verseKey: v.verseKey,
      surahId: v.surahId,
      surahName: surahNames.get(v.surahId) ?? `Surah ${v.surahId}`,
      pageNumber: v.pageNumber,
      ayahNumber: v.ayahNumber,
      state: hifzState,
      intervalDays: ms?.intervalDays ?? 0,
      dueAt: hifzState ? (ms?.dueDate.toISOString() ?? null) : null,
      stability: stabilityScore(
        hifzState,
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
  const now = new Date();
  const endOfToday = utcEndOfDay(now);
  const todayStart = utcStartOfDay(now);

  const [streakData, states, surahRows, todayReviewed, todayRead, futureDue, knownRows] =
    await Promise.all([
      deriveDisplayedStreak(userId),
      db.userMemoryState.findMany({
        where: { userId, dueDate: { lte: endOfToday }, state: { notIn: ["KNOWN", "READ"] } },
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
      db.surah.findMany({ select: { id: true, nameSimple: true } }),
      db.reviewLog.count({
        where: { userId, createdAt: { gte: todayStart } },
      }),
      db.readingLog.count({
        where: { userId, createdAt: { gte: todayStart } },
      }),
      db.userMemoryState.findMany({
        where: {
          userId,
          state: { notIn: ["KNOWN", "READ"] },
          dueDate: { gt: endOfToday },
        },
        select: { dueDate: true },
      }),
      db.userMemoryState.findMany({
        where: { userId, state: "KNOWN" },
        select: {
          verseKey: true,
          state: true,
          intervalDays: true,
          dueDate: true,
          lastReviewedAt: true,
          verse: { select: { surahId: true, ayahNumber: true, pageNumber: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
    ]);

  const names = buildSurahNameMap(surahRows);
  const user = streakData.user;
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
    if (s.state === "KNOWN" || s.state === "READ") continue;
    const bucket = buckets[s.state] ?? buckets.SABQI;
    bucket.push(toItem(s));
  }

  const totalItems =
    buckets.SABAQ.length + buckets.SABQI.length + buckets.MANZIL.length;

  const knownWindowStart = new Date(now.getTime() - KNOWN_REVISION_INTERVAL_DAYS * DAY_MS);
  const dueKnownRows = knownRows.filter((r) => r.dueDate <= endOfToday);
  const upcomingKnown = knownRows.find((r) => r.dueDate > endOfToday);
  const revisedRecently = knownRows.filter(
    (r) => r.lastReviewedAt !== null && r.lastReviewedAt >= knownWindowStart
  ).length;

  return {
    sabaq: buckets.SABAQ,
    sabqi: buckets.SABQI,
    manzil: buckets.MANZIL,
    estimatedMinutes: Math.ceil(totalItems * 1.5),
    scheduler: user.scheduler === "fsrs" ? "fsrs" : "sm2",
    requestRetention: user.requestRetention ?? DEFAULT_RETENTION,
    streak: {
      current: streakData.current,
      longest: streakData.longest,
      dailyTargetCount: user.dailyTargetCount,
      todayReviewed,
      todayRead,
      graceUsed: streakData.graceUsed,
    },
    forecast: bucketForecast(
      futureDue.map((row) => row.dueDate),
      endOfToday
    ),
    knownRevision: {
      totalKnown: knownRows.length,
      dueCount: dueKnownRows.length,
      revisedRecently,
      nextDueAt: upcomingKnown ? upcomingKnown.dueDate.toISOString() : null,
      dueItems: dueKnownRows.slice(0, MAX_QUEUE_ITEMS).map(toItem),
    },
  };
}

/**
 * Cumulative due counts at fixed horizons past a reference midnight.
 */
export function bucketForecast(dueDates: Date[], now: Date): DueForecast {
  let byDay = 0;
  let by3Days = 0;
  let by7Days = 0;
  let by30Days = 0;
  for (const d of dueDates) {
    const offset = d.getTime() - now.getTime();
    if (offset <= DAY_MS) byDay += 1;
    if (offset <= 3 * DAY_MS) by3Days += 1;
    if (offset <= 7 * DAY_MS) by7Days += 1;
    if (offset <= 30 * DAY_MS) by30Days += 1;
  }
  return { dueByDay: byDay, dueBy3Days: by3Days, dueBy7Days: by7Days, dueBy30Days: by30Days };
}
