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

const RECITER_BASE = "https://everyayah.com/data/Alafasy_128kbps";

export function everyAyahUrl(verseKey: string): string {
  const [s, a] = verseKey.split(":");
  return `${RECITER_BASE}/${s.padStart(3, "0")}${a.padStart(3, "0")}.mp3`;
}
