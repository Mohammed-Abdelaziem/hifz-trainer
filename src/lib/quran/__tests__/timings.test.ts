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
  });
});
