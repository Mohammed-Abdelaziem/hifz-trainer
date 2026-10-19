/**
 * The "surah:ayah" reference ("2:255") threaded through every hifz API,
 * queue and offline store. One validator keeps the format from drifting —
 * this regex used to be re-typed in six different files.
 */
export function isVerseKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{1,3}:\d{1,3}$/.test(value);
}
