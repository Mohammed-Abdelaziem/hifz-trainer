import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockEngineInstance = {
  onEnd: vi.fn(),
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

vi.mock("@/stores/reader-store", () => ({
  useReaderStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const store = {
      continuousPlay: true,
      selectAyah: vi.fn(),
      resetRevealed: vi.fn(),
      speed: 1,
      volume: 1,
    };
    return selector(store);
  }),
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
  mockEngineInstance.onEnd.mockClear();
  mockEngineInstance.destroy.mockClear();
  mockEngineInstance.isPlaying.mockReturnValue(false);
  mockEngineInstance.play.mockImplementation(() => {});
  mockEngineInstance.pause.mockImplementation(() => {});
  mockEngineInstance.destroy.mockImplementation(() => {});
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
});
