import { describe, expect, it } from "vitest";
import {
  synthTimings,
  everyAyahUrl,
  mergeSegments,
  toWordTimings,
  segmentsToTimings,
} from "@/lib/quran/timings";
import type { QuranWord } from "@/types/quran";

describe("timings", () => {
  describe("synthTimings", () => {
    it("returns one timing per word", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "بِسْمِ", translation: "In the name" },
        { id: "1:1:2", text_uthmani: "اللَّهِ", translation: "of Allah" },
      ];
      const timings = synthTimings(words);
      expect(timings).toHaveLength(2);
    });

    it("starts at 300ms", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "test", translation: "test" },
      ];
      const timings = synthTimings(words);
      expect(timings[0].start_ms).toBe(300);
      expect(timings[0].end_ms).toBeGreaterThan(300);
    });

    it("sequences timings with 130ms gap", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "a", translation: "a" },
        { id: "1:1:2", text_uthmani: "b", translation: "b" },
      ];
      const timings = synthTimings(words);
      expect(timings[1].start_ms).toBeGreaterThan(timings[0].end_ms);
    });

    it("handles empty word list", () => {
      expect(synthTimings([])).toEqual([]);
    });

    it("caps duration at 1800ms for very long words", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "a".repeat(100), translation: "very long" },
      ];
      const timings = synthTimings(words);
      const dur = timings[0].end_ms - timings[0].start_ms;
      expect(dur).toBeLessThanOrEqual(1800);
    });

    it("floors duration at 550ms for single character words", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "ا", translation: "alif" },
      ];
      const timings = synthTimings(words);
      const dur = timings[0].end_ms - timings[0].start_ms;
      expect(dur).toBeGreaterThanOrEqual(550);
    });

    it("handles exactly 1 word", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "بِسْمِ", translation: "In the name" },
      ];
      const timings = synthTimings(words);
      expect(timings).toHaveLength(1);
      expect(timings[0].start_ms).toBe(300);
    });

    it("handles words with mixed lengths", () => {
      const words: QuranWord[] = [
        { id: "1:1:1", text_uthmani: "ا", translation: "a" },
        { id: "1:1:2", text_uthmani: "بِسْمِ اللَّهِ", translation: "In the name of Allah" },
        { id: "1:1:3", text_uthmani: "و", translation: "and" },
      ];
      const timings = synthTimings(words);
      expect(timings).toHaveLength(3);
      expect(timings[0].start_ms).toBe(300);
      expect(timings[1].start_ms).toBeGreaterThan(timings[0].end_ms);
      expect(timings[2].start_ms).toBeGreaterThan(timings[1].end_ms);
    });

    it("timings are strictly increasing", () => {
      const words: QuranWord[] = Array.from({ length: 10 }, (_, i) => ({
        id: `1:1:${i + 1}`,
        text_uthmani: `word${i}`,
        translation: `word${i}`,
      }));
      const timings = synthTimings(words);
      for (let i = 1; i < timings.length; i++) {
        expect(timings[i].start_ms).toBeGreaterThan(timings[i - 1].start_ms);
        expect(timings[i].end_ms).toBeGreaterThan(timings[i].start_ms);
      }
    });
  });

  describe("everyAyahUrl", () => {
    it("generates correct URL for verse 1:1", () => {
      expect(everyAyahUrl("1:1")).toBe("https://everyayah.com/data/Alafasy_128kbps/001001.mp3");
    });

    it("pads surah and ayah to 3 digits", () => {
      expect(everyAyahUrl("112:4")).toBe("https://everyayah.com/data/Alafasy_128kbps/112004.mp3");
    });

    it("handles large surah numbers", () => {
      expect(everyAyahUrl("114:6")).toBe("https://everyayah.com/data/Alafasy_128kbps/114006.mp3");
    });

    it("handles single-digit surah and ayah", () => {
      expect(everyAyahUrl("2:1")).toBe("https://everyayah.com/data/Alafasy_128kbps/002001.mp3");
    });

    it("handles verse 114:1", () => {
      expect(everyAyahUrl("114:1")).toBe("https://everyayah.com/data/Alafasy_128kbps/114001.mp3");
    });

    it("produces a URL ending in .mp3", () => {
      expect(everyAyahUrl("50:1")).toMatch(/\.mp3$/);
    });

    it("result always contains the base path", () => {
      expect(everyAyahUrl("1:1")).toContain("everyayah.com/data/Alafasy_128kbps/");
    });
  });

  describe("mergeSegments", () => {
    it("maps quran.com 1:1 segments onto word indexes", () => {
      const merged = mergeSegments([
        [0, 1, 60, 610],
        [1, 2, 620, 1310],
        [2, 3, 1320, 2450],
        [3, 4, 2460, 5970],
      ]);
      expect(merged).toEqual([
        [0, 60, 610],
        [1, 620, 1310],
        [2, 1320, 2450],
        [3, 2460, 5970],
      ]);
    });

    it("merges multiple segments spanning one word", () => {
      const merged = mergeSegments([
        [0, 1, 100, 400],
        [0, 1, 500, 900],
        [1, 2, 1000, 1500],
      ]);
      expect(merged).toEqual([
        [0, 100, 900],
        [1, 1000, 1500],
      ]);
    });

    it("sorts by word index", () => {
      const merged = mergeSegments([
        [2, 3, 300, 400],
        [0, 1, 100, 200],
        [1, 2, 200, 300],
      ]);
      expect(merged.map((m) => m[0])).toEqual([0, 1, 2]);
    });

    it("returns empty for missing input", () => {
      expect(mergeSegments(undefined)).toEqual([]);
      expect(mergeSegments(null)).toEqual([]);
      expect(mergeSegments([])).toEqual([]);
    });

    it("drops malformed segments", () => {
      const merged = mergeSegments([
        [0, 1, 100, 100] as never,
        [0, 1, 500, 400] as never,
        [0, 1] as never,
        [-1, 0, 100, 200] as never,
        [0, 1, Number.NaN, 200] as never,
        [0, 1, 150, 250] as never,
      ]);
      expect(merged).toEqual([[0, 150, 250]]);
    });
  });

  describe("toWordTimings", () => {
    it("builds one timing per word", () => {
      const timings = toWordTimings(
        [
          [0, 60, 610],
          [1, 620, 1310],
        ],
        2
      );
      expect(timings).toEqual([
        { start_ms: 60, end_ms: 610 },
        { start_ms: 620, end_ms: 1310 },
      ]);
    });

    it("returns empty when a word index is missing", () => {
      expect(
        toWordTimings(
          [
            [0, 60, 610],
            [2, 900, 1000],
          ],
          3
        )
      ).toEqual([]);
    });

    it("returns empty when segment count does not match word count", () => {
      expect(
        toWordTimings(
          [
            [0, 60, 610],
            [1, 620, 1310],
          ],
          3
        )
      ).toEqual([]);
    });

    it("returns empty for zero words", () => {
      expect(toWordTimings([], 0)).toEqual([]);
    });

    it("rejects out-of-order indexes", () => {
      expect(
        toWordTimings(
          [
            [1, 60, 610],
            [0, 620, 1310],
          ],
          2
        )
      ).toEqual([]);
    });
  });

  describe("segmentsToTimings", () => {
    it("converts real segments end to end", () => {
      expect(
        segmentsToTimings(
          [
            [0, 1, 60, 610],
            [1, 2, 620, 1310],
          ],
          2
        )
      ).toEqual([
        { start_ms: 60, end_ms: 610 },
        { start_ms: 620, end_ms: 1310 },
      ]);
    });

    it("handles a single-word verse", () => {
      expect(segmentsToTimings([[0, 1, 30, 7080]], 1)).toEqual([{ start_ms: 30, end_ms: 7080 }]);
    });

    it("falls back to empty when timings are unavailable", () => {
      expect(segmentsToTimings(undefined, 4)).toEqual([]);
    });
  });
});
