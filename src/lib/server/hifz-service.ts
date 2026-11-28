/**
 * Backwards-compatible facade re-exporting the decomposed Hifz server services.
 * Prefer importing from the focused service modules directly for new code.
 */
export {
  STREAK_ACTIVITY_WINDOW_DAYS,
  computeStreak,
  getActivityDayKeys,
  deriveDisplayedStreak,
  getAchievementSnapshot,
} from "./streak-service";

export {
  buildSurahNameMap,
  ensureMissingSurahsForKeys,
} from "./corpus-seeder";

export {
  addToSabaq,
  markKnown,
  type KnownMarkResult,
} from "./plan-service";

export {
  recordReview,
  recordReading,
  recordKnownRevision,
  type ReviewResult,
} from "./review-service";

export {
  getSurahProgress,
  getSurahVerseStates,
  buildMemoryMap,
  buildDailyQueue,
  bucketForecast,
} from "./queue-service";

export type { SurahProgress } from "@/types/srs";
