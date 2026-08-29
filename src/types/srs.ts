import type { MemoryState, SchedulerKind } from "./quran";

export interface StreakInfo {
  current: number;
  longest: number;
  dailyTargetCount: number;
  todayReviewed: number;
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
}

export interface MemoryMapPayload {
  verses: MemoryCell[];
}
