import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { SurahBundle } from "@/types/quran";

const mockSurah: SurahBundle = {
  id: 1,
  name_arabic: "الفاتحة",
  name_simple: "Al-Fatiha",
  english_name: "The Opening",
  revelation_place: "makkah",
  ayah_count: 2,
  ayahs: [
    {
      ayah_number: 1,
      verse_key: "1:1",
      words: [
        { id: "1:1:1", text_uthmani: "بِسْمِ", translation: "In the name", root: "bsm" },
      ],
      audio_url: "https://example.com/101.mp3",
      timings: [{ start_ms: 0, end_ms: 1000 }],
      tafsir: "Test tafsir",
    },
    {
      ayah_number: 2,
      verse_key: "1:2",
      words: [
        { id: "1:2:1", text_uthmani: "الْحَمْدُ", translation: "All praise", root: "hmd" },
      ],
      audio_url: "https://example.com/102.mp3",
      timings: [{ start_ms: 0, end_ms: 1000 }],
      tafsir: "",
    },
  ],
};

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSelectAyah = vi.fn();
const mockSetReciterId = vi.fn();

vi.mock("@/stores/reader-store", () => ({
  useReaderStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const store = {
      selectedVerseKey: "1:1",
      reciterId: "ar.alafasy",
      selectAyah: mockSelectAyah,
      setReciterId: mockSetReciterId,
      speed: 1,
      volume: 1,
    };
    return selector(store);
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        words: [
          { id: "1:1:1", text_uthmani: "بِسْمِ", translation: "In the name", root: "bsm" },
        ],
        recitationUrl: null,
        tafsir: "Test tafsir",
      }),
  });
});

describe("useVerseData", () => {
  it("returns selected ayah from surah", async () => {
    const { useVerseData } = await import("@/hooks/audio/use-verse-data");
    const { result } = renderHook(() => useVerseData(mockSurah, true));
    expect(result.current.selected).toBeDefined();
    expect(result.current.selected?.verse_key).toBe("1:1");
  });

  it("returns null selected when no ayahs", async () => {
    const { useVerseData } = await import("@/hooks/audio/use-verse-data");
    const emptySurah = { ...mockSurah, ayahs: [] };
    const { result } = renderHook(() => useVerseData(emptySurah, false));
    expect(result.current.selected).toBeNull();
  });

  it("fetches live data on mount", async () => {
    const { useVerseData } = await import("@/hooks/audio/use-verse-data");
    renderHook(() => useVerseData(mockSurah, true));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ayah-data?verseKey=1%3A1")
      );
    });
  });

  it("includes reciter in fetch URL", async () => {
    const { useVerseData } = await import("@/hooks/audio/use-verse-data");
    renderHook(() => useVerseData(mockSurah, true));
    await waitFor(() => {
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("reciter=ar.alafasy");
    });
  });

  it("constructs effectiveSelected with everyAyahUrl", async () => {
    const { useVerseData } = await import("@/hooks/audio/use-verse-data");
    const { result } = renderHook(() => useVerseData(mockSurah, true));
    await waitFor(() => {
      expect(result.current.effectiveSelected.audio_url).toContain("everyayah.com");
    });
  });

  it("uses original surah words when fetch has no words", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          words: [],
          recitationUrl: null,
          tafsir: null,
        }),
    });
    const { useVerseData } = await import("@/hooks/audio/use-verse-data");
    const { result } = renderHook(() => useVerseData(mockSurah, true));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    await vi.waitFor(() => {
      // live is null because fetch returned empty words, so effectiveSelected falls back to selected
      expect(result.current.live).toBeNull();
      expect(result.current.effectiveSelected.words.length).toBe(1);
      expect(result.current.effectiveSelected.audio_url).toBe("https://example.com/101.mp3");
    });
  });
});
