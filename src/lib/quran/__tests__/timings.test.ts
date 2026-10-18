import { describe, expect, it } from "vitest";
import { synthTimings, everyAyahUrl } from "@/lib/quran/timings";
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
});
