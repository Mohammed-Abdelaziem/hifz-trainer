// Font size
export const FONT_SIZE_MIN = 22;
export const FONT_SIZE_MAX = 56;
export const FONT_SIZE_DEFAULT = 32;

// Daily target
export const DAILY_TARGET_MIN = 5;
export const DAILY_TARGET_MAX = 50;

/** Largest number of verses that can be added to the plan in one request. */
export const SABAQ_BATCH_MAX = 50;

// Day in milliseconds
export const DAY_MS = 86_400_000;

// Quran API
export const QURAN_API_BASE = "https://api.quran.com/api/v4";
export const VERSES_CDN = "https://verses.quran.com/";

// API timeouts (ms)
export const API_TIMEOUT_SHORT_MS = 2500;
export const API_TIMEOUT_MEDIUM_MS = 12_000;
export const API_TIMEOUT_LONG_MS = 20_000;

// Audio
export const SPEED_MIN = 0.5;
export const SPEED_MAX = 1.5;
export const VOLUME_MIN = 0;
export const VOLUME_MAX = 1;

// Reader
/** Number of verses loaded per lazy chunk in the reader viewport. */
export const VERSE_CHUNK = 15;

// Reader UI lifetimes (ms)
export const SYNC_STATUS_RESET_MS = 3000;
export const GRADE_FLASH_MS = 2600;

/** Floor for audio progress-bar scale so a tiny clip still shows a track. */
export const PROGRESS_BAR_MIN_MS = 8000;

// Reader retention slider bounds, as whole percentages. Keep in step with
// MIN_RETENTION / MAX_RETENTION in lib/srs/fsrs.
export const RETENTION_PERCENT_MIN = 70;
export const RETENTION_PERCENT_MAX = 98;

/** Daily review target a brand-new user starts with. */
export const DEFAULT_DAILY_TARGET = 10;

// SRS defaults
export const DEFAULT_RETENTION = 0.9;
