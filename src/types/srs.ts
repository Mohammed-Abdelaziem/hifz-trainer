import type { MemoryState, SchedulerKind } from "./quran";
import type { XpLevel } from "@/lib/xp";
import type { Achievement } from "@/lib/achievements";

export interface StreakInfo {
  current: number;
  longest: number;
  dailyTargetCount: number;
  todayReviewed: number;
  todayRead: number;
  /**
   * True when the displayed run has already consumed its bridged miss (the
   * ledger freeze). Nested form only — the review-transaction payload omits
   * it (its transient value is not the displayed source of truth).
   */
  graceUsed?: boolean;
}

/** Cumulative due counts at upcoming horizons (excluding today's queue). */
export interface DueForecast {
  dueByDay: number; // within the next 1 day
  dueBy3Days: number; // within the next 3 days
  dueBy7Days: number; // within the next 7 days
  dueBy30Days: number; // within the next 30 days
}

export interface QueueItem {
  verseKey: string;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  pageNumber: number;
  dueAt: string;
  intervalDays: number;
}

export interface KnownRevisionSummary {
  totalKnown: number;
  dueCount: number;
  revisedRecently: number;
  nextDueAt: string | null;
  dueItems: QueueItem[];
}

export interface DailyQueue {
  sabaq: QueueItem[];
  sabqi: QueueItem[];
  manzil: QueueItem[];
  estimatedMinutes: number;
  scheduler: SchedulerKind;
  requestRetention: number;
  streak: StreakInfo;
  /** Signed-in only: cumulative due counts at upcoming horizons (after today). */
  forecast?: DueForecast;
  /** Signed-in only: periodic revision tracking for KNOWN surahs/verses. */
  knownRevision?: KnownRevisionSummary;
}

export interface MemoryCell {
  verseKey: string;
  surahId: number;
  surahName: string;
  pageNumber: number;
  ayahNumber: number;
  state: MemoryState | null;
  intervalDays: number;
  dueAt: string | null;
  stability: number | null;
  readCount: number;
}

/** Per-surah tracking counts shown in the reader header. */
export interface SurahProgress {
  total: number;
  sabaq: number;
  sabqi: number;
  manzil: number;
  known: number;
  /** Signed-in only, newest conformance: per-mushaf-page breakdown. */
  pages?: PageProgress[];
}

/** How much of one mushaf page of this surah is known / still in rotation. */
export interface PageProgress {
  page: number;
  total: number;
  known: number;
  learning: number;
}

/** Per-verse memory snapshot hydrated into the reader for a surah. */
export interface SurahVerseState {
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapses: number;
  difficulty: number | null;
  stability: number | null;
}

export interface MemoryMapPayload {
  verses: MemoryCell[];
}

export interface RecapData {
  reviewsThisWeek: number;
  reviewsLastWeek: number;
  activeDaysThisWeek: number;
  bestDay: { date: string; count: number } | null;
  topSurah: { surahId: number; name: string; count: number } | null;
  xpThisWeek: number;
}

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
  /** All-time XP / level, derived from every logged grade. */
  xp: XpLevel;
  /** Last-week vs previous-week motivation recap, from the same ledger. */
  recap: RecapData;
  /** Badge list evaluated against durable state (see src/lib/achievements). */
  achievements: Achievement[];
}
