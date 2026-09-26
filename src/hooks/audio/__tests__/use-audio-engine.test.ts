import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockEngineInstance = {
  onEnd: vi.fn(),
  onVerseChange: vi.fn(),
  setSurahTimings: vi.fn(),
  clearSurahTimings: vi.fn(),
  load: vi.fn(() => Promise.resolve()),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  destroy: vi.fn(),
  isPlaying: vi.fn(() => false),
  setRate: vi.fn(),
  setVolume: vi.fn(),
  getRate: vi.fn(() => 1),
  getVolume: vi.fn(() => 1),
  seekMs: vi.fn(),
  nowMs: vi.fn(() => 0),
  durationMs: vi.fn(() => null),
  playClip: vi.fn(() => Promise.resolve()),
  abortClips: vi.fn(),
  getMode: vi.fn(() => "idle"),
};

vi.mock("@/lib/audio/engine", () => ({
  AudioEngine: vi.fn().mockImplementation(function () {
    return { ...mockEngineInstance };
  }),
}));

const mockSelectAyah = vi.fn();
const mockResetRevealed = vi.fn();

const storeState: Record<string, unknown> = {
  continuousPlay: true,
  surahAudioMode: false,
  reciterId: 7,
  speed: 1,
  volume: 1,
};

vi.mock("@/stores/reader-store", () => ({
  useReaderStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      ...storeState,
      selectAyah: mockSelectAyah,
      resetRevealed: mockResetRevealed,
    })
  ),
}));

const mockFetchVerseTimings = vi.fn(() => Promise.resolve([] as { verseKey: string; start_ms: number; end_ms: number }[]));

vi.mock("@/lib/audio/full-surah", () => ({
  getSurahAudioUrl: vi.fn(() => "https://example.com/surah.mp3"),
  fetchVerseTimings: (...args: unknown[]) => mockFetchVerseTimings(...(args as [])),
}));

import { useAudioEngine } from "@/hooks/audio/use-audio-engine";

function makeSurah(ayahCount: number) {
  const ayahs = Array.from({ length: ayahCount }, (_, i) => ({
    ayah_number: i + 1,
    verse_key: `1:${i + 1}`,
    words: [],
    audio_url: `https://example.com/${i + 1}.mp3`,
    timings: [],
    tafsir: "",
  }));
  return {
    id: 1,
    name_arabic: "الفاتحة",
    name_simple: "Al-Fatiha",
    english_name: "The Opening",
    revelation_place: "makkah" as const,
    ayah_count: ayahCount,
    ayahs,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  storeState.surahAudioMode = false;
  storeState.continuousPlay = true;
  storeState.reciterId = 7;
  mockEngineInstance.onEnd.mockClear();
  mockEngineInstance.onVerseChange.mockClear();
  mockEngineInstance.setSurahTimings.mockClear();
  mockEngineInstance.clearSurahTimings.mockClear();
  mockEngineInstance.destroy.mockClear();
  mockEngineInstance.isPlaying.mockReturnValue(false);
  mockEngineInstance.play.mockImplementation(() => {});
  mockEngineInstance.pause.mockImplementation(() => {});
  mockEngineInstance.destroy.mockImplementation(() => {});
  mockSelectAyah.mockClear();
  mockResetRevealed.mockClear();
});

describe("useAudioEngine", () => {
  it("returns an AudioEngine instance", () => {
    const surah = makeSurah(3);
    const { result } = renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[0],
        hasAyahs: true,
        enableKeyboard: false,
      })
    );
    expect(result.current).toBeDefined();
    expect(result.current.play).toBeDefined();
  });

  it("registers an end callback via engine.onEnd", () => {
    const surah = makeSurah(3);
    renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[0],
        hasAyahs: true,
        enableKeyboard: false,
      })
    );
    expect(mockEngineInstance.onEnd).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls engine.destroy on unmount", () => {
    const surah = makeSurah(3);
    const { unmount } = renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[0],
        hasAyahs: true,
        enableKeyboard: false,
      })
    );
    unmount();
    expect(mockEngineInstance.destroy).toHaveBeenCalled();
  });

  it("does not add keyboard listener when enableKeyboard is false", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const surah = makeSurah(3);
    renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[0],
        hasAyahs: true,
        enableKeyboard: false,
      })
    );
    const keydownCalls = addSpy.mock.calls.filter(([e]) => e === "keydown");
    expect(keydownCalls.length).toBe(0);
    addSpy.mockRestore();
  });

  it("adds keyboard listener when enableKeyboard is true", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const surah = makeSurah(3);
    renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[0],
        hasAyahs: true,
        enableKeyboard: true,
      })
    );
    const keydownCalls = addSpy.mock.calls.filter(([e]) => e === "keydown");
    expect(keydownCalls.length).toBe(1);
    addSpy.mockRestore();
  });

  it("advances to next ayah when continuous play ends mid-surah", () => {
    const surah = makeSurah(3);

    renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[0],
        hasAyahs: true,
        enableKeyboard: false,
      })
    );

    const endCb = mockEngineInstance.onEnd.mock.calls[0][0];
    endCb();

    expect(mockSelectAyah).toHaveBeenCalledWith("1:2");
    expect(mockResetRevealed).toHaveBeenCalledWith("1:2");
  });

  it("navigates to next surah when continuous play ends on last ayah", () => {
    const surah = makeSurah(2);
    const nextSurahs = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];
    const assignSpy = vi.fn();
    Object.defineProperty(window, "location", {
      value: { set href(v: string) { assignSpy(v); }, get href() { return ""; } },
      writable: true,
      configurable: true,
    });

    renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[1],
        hasAyahs: true,
        enableKeyboard: false,
        availableSurahs: nextSurahs,
        surahUrl: (id) => `/reader/${id}`,
      })
    );

    const endCb = mockEngineInstance.onEnd.mock.calls[0][0];
    endCb();

    expect(assignSpy).toHaveBeenCalledWith("/reader/2");
  });

  it("does not navigate when on last ayah with no next surah", () => {
    const surah = makeSurah(2);
    const assignSpy = vi.fn();
    Object.defineProperty(window, "location", {
      value: { set href(v: string) { assignSpy(v); }, get href() { return ""; } },
      writable: true,
      configurable: true,
    });

    renderHook(() =>
      useAudioEngine({
        surah,
        selected: surah.ayahs[1],
        hasAyahs: true,
        enableKeyboard: false,
        availableSurahs: [{ id: 1 }],
        surahUrl: (id) => `/reader/${id}`,
      })
    );

    const endCb = mockEngineInstance.onEnd.mock.calls[0][0];
    endCb();

    expect(assignSpy).not.toHaveBeenCalled();
  });

  describe("effect stability", () => {
    it("does not refetch verse timings when inline callbacks change identity", async () => {
      storeState.surahAudioMode = true;
      const surah = makeSurah(3);

      const { rerender } = renderHook(() =>
        useAudioEngine({
          surah,
          selected: surah.ayahs[0],
          hasAyahs: true,
          enableKeyboard: false,
          // New identity on every render, as callers pass inline arrows
          onVerseChange: () => window.scrollTo({ top: 0, behavior: "smooth" }),
          surahUrl: (id) => `/quran?surah=${id}`,
        })
      );

      rerender();
      rerender();
      rerender();
      await vi.waitFor(() => {
        expect(mockEngineInstance.setSurahTimings).toHaveBeenCalledTimes(1);
      });

      expect(mockFetchVerseTimings).toHaveBeenCalledTimes(1);
    });

    it("does not re-register the end callback when inline callbacks change identity", () => {
      const surah = makeSurah(3);

      const { rerender } = renderHook(() =>
        useAudioEngine({
          surah,
          selected: surah.ayahs[0],
          hasAyahs: true,
          enableKeyboard: false,
          onVerseChange: () => window.scrollTo({ top: 0 }),
          surahUrl: (id) => `/quran?surah=${id}`,
        })
      );

      rerender();
      rerender();

      expect(mockEngineInstance.onEnd).toHaveBeenCalledTimes(1);
    });

    it("still invokes the latest onVerseChange and surahUrl", () => {
      const surah = makeSurah(2);
      const first = vi.fn();
      const second = vi.fn();

      const { rerender } = renderHook(
        ({ cb }: { cb: () => void }) =>
          useAudioEngine({
            surah,
            selected: surah.ayahs[0],
            hasAyahs: true,
            enableKeyboard: false,
            onVerseChange: cb,
          }),
        { initialProps: { cb: first } }
      );

      const endCb = mockEngineInstance.onEnd.mock.calls[0][0];
      endCb();
      expect(first).toHaveBeenCalledTimes(1);

      rerender({ cb: second });
      endCb();
      expect(second).toHaveBeenCalledTimes(1);
      expect(first).toHaveBeenCalledTimes(1);
    });

    it("refetches verse timings when the reciter changes", () => {
      storeState.surahAudioMode = true;
      const surah = makeSurah(3);

      const { rerender } = renderHook(() =>
        useAudioEngine({
          surah,
          selected: surah.ayahs[0],
          hasAyahs: true,
          enableKeyboard: false,
          surahUrl: (id) => `/quran?surah=${id}`,
        })
      );
      expect(mockFetchVerseTimings).toHaveBeenCalledTimes(1);

      storeState.reciterId = 6;
      rerender();

      expect(mockFetchVerseTimings).toHaveBeenCalledTimes(2);
    });
  });
});
