import { describe, expect, it } from "vitest";
import { resolveSurahPlaybackPosition } from "@/hooks/use-audio-sync";
import type { VerseTiming } from "@/lib/audio/full-surah";
import type { WordTiming } from "@/types/quran";

/**
 * Two verses back to back in a full-surah MP3. Verse 19:2 starts at 10_000ms.
 */
const VERSE_TIMINGS: VerseTiming[] = [
  { verseKey: "19:1", start_ms: 0, end_ms: 10_000 },
  { verseKey: "19:2", start_ms: 10_000, end_ms: 20_000 },
];

/** Word timings are relative to the start of their own ayah. */
const VERSE_ONE_WORDS: WordTiming[] = [
  { start_ms: 300, end_ms: 900 },
  { start_ms: 900, end_ms: 1600 },
  { start_ms: 1600, end_ms: 2400 },
];

describe("resolveSurahPlaybackPosition", () => {
  it("highlights a word inside the first verse", () => {
    const result = resolveSurahPlaybackPosition({
      pos: 1000,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:1",
    });
    expect(result.activeVerseKey).toBe("19:1");
    expect(result.activeIndex).toBe(1);
  });

  it("subtracts the verse offset for the second verse", () => {
    // Without the offset this would compare 11_200 against word timings that
    // start at 300ms and never match, which is why nothing highlighted.
    const result = resolveSurahPlaybackPosition({
      pos: 11_200,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:2",
    });
    // 11_200 - 10_000 = 1_200, which falls inside word 1 (900-1600).
    expect(result.activeVerseKey).toBe("19:2");
    expect(result.activeIndex).toBe(1);
  });

  it("returns -1 on the tick where the verse changes", () => {
    // The selected verse's word timings still describe the previous verse on
    // this tick, so highlighting against them would light the wrong word.
    const result = resolveSurahPlaybackPosition({
      pos: 10_500,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:1",
    });
    expect(result.activeVerseKey).toBe("19:2");
    expect(result.activeIndex).toBe(-1);
  });

  it("keeps highlighting within the same verse across ticks", () => {
    const first = resolveSurahPlaybackPosition({
      pos: 700,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:1",
    });
    const second = resolveSurahPlaybackPosition({
      pos: 1200,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:1",
    });
    expect(first.activeIndex).toBe(0);
    expect(second.activeIndex).toBe(1);
  });

  it("returns -1 when there are no word timings", () => {
    const result = resolveSurahPlaybackPosition({
      pos: 1000,
      verseTimings: VERSE_TIMINGS,
      wordTimings: [],
      previousVerseKey: "19:1",
    });
    expect(result.activeVerseKey).toBe("19:1");
    expect(result.activeIndex).toBe(-1);
  });

  it("returns -1 before playback starts", () => {
    const result = resolveSurahPlaybackPosition({
      pos: 0,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: null,
    });
    expect(result.activeIndex).toBe(-1);
  });

  it("holds the last verse once past the final timing", () => {
    const result = resolveSurahPlaybackPosition({
      pos: 25_000,
      verseTimings: VERSE_TIMINGS,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:2",
    });
    expect(result.activeVerseKey).toBe("19:2");
    // Past the end of the verse there is no word to light.
    expect(result.activeIndex).toBe(-1);
  });

  it("works for a long surah by using the correct offset per verse", () => {
    const many: VerseTiming[] = Array.from({ length: 98 }, (_, i) => ({
      verseKey: `19:${i + 1}`,
      start_ms: i * 5_000,
      end_ms: (i + 1) * 5_000,
    }));
    const result = resolveSurahPlaybackPosition({
      pos: 50 * 5_000 + 1_700,
      verseTimings: many,
      wordTimings: VERSE_ONE_WORDS,
      previousVerseKey: "19:51",
    });
    expect(result.activeVerseKey).toBe("19:51");
    // 1_700 is inside the third word (1600-2400).
    expect(result.activeIndex).toBe(2);
  });
});