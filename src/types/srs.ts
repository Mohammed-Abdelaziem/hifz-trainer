import type { MemoryState, SchedulerKind } from "./quran";

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
}

export interface MemoryMapPayload {
  verses: MemoryCell[];
}
