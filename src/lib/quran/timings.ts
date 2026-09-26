import type { QuranWord, WordTiming } from "@/types/quran";

export function synthTimings(words: QuranWord[]): WordTiming[] {
  let cursor = 300;
  return words.map((w) => {
    const dur = Math.min(1800, Math.max(550, 380 + w.text_uthmani.length * 95));
    const seg = { start_ms: cursor, end_ms: cursor + dur };
    cursor = seg.end_ms + 130;
    return seg;
  });
}

export type RawSegment = [number, number, number, number];

/** `[wordIndex, startMs, endMs]` */
export type MergedSegment = [number, number, number];

/**
 * Collapses quran.com recitation segments into one entry per word.
 *
 * Raw segments are `[wordStartIdx, wordEndIdx, startMs, endMs]`. A single word
 * can span multiple segments (a stretched letter, a waqf pause), so ranges are
 * merged by taking the earliest start and latest end for that word index.
 * Output is sorted by word index.
 */
export function mergeSegments(segments: RawSegment[] | undefined | null): MergedSegment[] {
  if (!Array.isArray(segments) || segments.length === 0) return [];

  const merged = new Map<number, { start: number; end: number }>();
  for (const seg of segments) {
    if (!Array.isArray(seg) || seg.length < 4) continue;
    const wordIndex = seg[0];
    const startMs = seg[2];
    const endMs = seg[3];
    if (!Number.isInteger(wordIndex) || wordIndex < 0) continue;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue;

    const existing = merged.get(wordIndex);
    if (existing) {
      existing.start = Math.min(existing.start, startMs);
      existing.end = Math.max(existing.end, endMs);
    } else {
      merged.set(wordIndex, { start: startMs, end: endMs });
    }
  }

  return [...merged.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([wordIndex, range]) => [wordIndex, range.start, range.end]);
}

/**
 * Maps merged segments onto a verse's word list.
 *
 * Returns an empty array unless every word index `0..wordCount - 1` is covered,
 * so callers can fall back to synthetic timings rather than highlight a verse
 * with partial or misaligned data.
 */
export function toWordTimings(merged: MergedSegment[], wordCount: number): WordTiming[] {
  if (wordCount <= 0 || merged.length !== wordCount) return [];

  const timings: WordTiming[] = new Array(wordCount);
  for (let i = 0; i < wordCount; i++) {
    const entry = merged[i];
    if (!entry || entry[0] !== i) return [];
    timings[i] = { start_ms: entry[1], end_ms: entry[2] };
  }
  return timings;
}

/** Convenience wrapper: raw segments straight to per-word timings. */
export function segmentsToTimings(segments: RawSegment[] | undefined | null, wordCount: number): WordTiming[] {
  return toWordTimings(mergeSegments(segments), wordCount);
}

const RECITER_BASE = "https://everyayah.com/data/Alafasy_128kbps";

export function everyAyahUrl(verseKey: string): string {
  const [s, a] = verseKey.split(":");
  return `${RECITER_BASE}/${s.padStart(3, "0")}${a.padStart(3, "0")}.mp3`;
}
