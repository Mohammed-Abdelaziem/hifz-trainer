import { isVerseKey } from "@/lib/quran/verse-key";
import { MAX_RETENTION, MIN_RETENTION } from "@/lib/srs/fsrs";
import { DAILY_TARGET_MAX, DAILY_TARGET_MIN, MAX_AYAH_COUNT } from "@/lib/constants";

const VALID_SCHEDULERS = new Set(["sm2", "fsrs"]);

export interface VerseSelectionBody {
  verseKeys?: unknown;
  surahId?: unknown;
  fromAyah?: unknown;
  toAyah?: unknown;
}

export type VerseSelectionResult =
  | { ok: true; verseKeys: string[] }
  | { ok: false; error: string };

/**
 * Shared parser for endpoints that accept either an explicit `verseKeys` array
 * or a `surahId` + `fromAyah`..`toAyah` range (e.g. /api/plan, /api/memory-state).
 */
export function parseVerseSelection(
  body: VerseSelectionBody,
  opts: { maxCount: number; verb: string }
): VerseSelectionResult {
  let verseKeys: string[] = [];

  if (Array.isArray(body.verseKeys)) {
    verseKeys = body.verseKeys.filter((k) => isVerseKey(k));
  } else if (body.surahId !== undefined) {
    const surahId = Number(body.surahId);
    const fromAyah = Number(body.fromAyah ?? 1);
    const toAyah = Number(body.toAyah ?? fromAyah);
    if (
      !Number.isInteger(surahId) ||
      surahId < 1 ||
      surahId > 114 ||
      !Number.isInteger(fromAyah) ||
      !Number.isInteger(toAyah) ||
      fromAyah < 1 ||
      toAyah < fromAyah ||
      toAyah > MAX_AYAH_COUNT
    ) {
      return { ok: false, error: "Invalid surah or ayah range" };
    }
    const span = toAyah - fromAyah + 1;
    if (span > opts.maxCount) {
      return { ok: false, error: `${opts.verb} at most ${opts.maxCount} verses at a time` };
    }
    verseKeys = Array.from({ length: span }, (_, i) => `${surahId}:${fromAyah + i}`);
  } else {
    return { ok: false, error: "Provide verseKeys or a surah range" };
  }

  if (verseKeys.length === 0) {
    return { ok: false, error: "No valid verse keys" };
  }
  if (verseKeys.length > opts.maxCount) {
    return { ok: false, error: `${opts.verb} at most ${opts.maxCount} verses at a time` };
  }

  return { ok: true, verseKeys };
}

export interface ProfileSettingsPatch {
  scheduler?: "sm2" | "fsrs";
  requestRetention?: number;
  dailyTargetCount?: number;
}

export type ProfileValidationResult =
  | { ok: true; data: ProfileSettingsPatch }
  | { ok: false; error: string };

/**
 * Shared validator for user study profile fields (scheduler, retention, daily
 * target), used by both /api/settings and /api/backup.
 */
export function validateProfileSettings(
  raw: Record<string, unknown>,
  fieldPrefix = ""
): ProfileValidationResult {
  const data: ProfileSettingsPatch = {};

  if (raw.scheduler !== undefined) {
    if (typeof raw.scheduler !== "string" || !VALID_SCHEDULERS.has(raw.scheduler)) {
      return { ok: false, error: `${fieldPrefix}scheduler must be 'sm2' or 'fsrs'` };
    }
    data.scheduler = raw.scheduler as "sm2" | "fsrs";
  }

  if (raw.requestRetention !== undefined) {
    const r = Number(raw.requestRetention);
    if (!Number.isFinite(r) || r < MIN_RETENTION || r > MAX_RETENTION) {
      return {
        ok: false,
        error: `${fieldPrefix}requestRetention must be between ${MIN_RETENTION} and ${MAX_RETENTION}`,
      };
    }
    data.requestRetention = Math.round(r * 100) / 100;
  }

  if (raw.dailyTargetCount !== undefined) {
    const t = Number(raw.dailyTargetCount);
    if (!Number.isInteger(t) || t < DAILY_TARGET_MIN || t > DAILY_TARGET_MAX) {
      return {
        ok: false,
        error: `${fieldPrefix}dailyTargetCount must be between ${DAILY_TARGET_MIN} and ${DAILY_TARGET_MAX}`,
      };
    }
    data.dailyTargetCount = t;
  }

  return { ok: true, data };
}
