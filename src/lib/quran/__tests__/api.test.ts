import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { getSurahBundle, getAvailableSurahs } from "@/lib/quran/api";
import { getDb } from "@/lib/db";

describe("quran/api — getSurahBundle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db not configured"));
  });

  it("returns fixture for surah 1 (Al-Fatiha)", async () => {
    const bundle = await getSurahBundle(1);
    expect(bundle).not.toBeNull();
    expect(bundle!.id).toBe(1);
    expect(bundle!.ayahs.length).toBe(7);
    expect(bundle!.ayahs[0].verse_key).toBe("1:1");
  });

  it("returns fixture for surah 112 (Al-Ikhlas)", async () => {
    const bundle = await getSurahBundle(112);
    expect(bundle).not.toBeNull();
    expect(bundle!.id).toBe(112);
    expect(bundle!.ayahs.length).toBe(4);
  });

  it("still returns fixture even if fetchChapterMeta fails", async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network fail"));
    try {
      const bundle = await getSurahBundle(1);
      expect(bundle).not.toBeNull();
      expect(bundle!.id).toBe(1);
      expect(bundle!.ayahs.length).toBe(7);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("fetches from DB for non-fixture surahs", async () => {
    const db = {
      surah: {
        findUnique: vi.fn().mockResolvedValue({
          id: 2,
          nameArabic: "سُورَةُ الْبَقَرَة",
          nameSimple: "Al-Baqara",
          englishName: "The Cow",
          revelationPlace: "madinah",
          ayahCount: 2,
        }),
      },
      verse: {
        findMany: vi.fn().mockResolvedValue([
          {
            ayahNumber: 1,
            verseKey: "2:1",
            uthmaniText: "الم",
            wordsJson: null,
            audioUrl: null,
            tafsir: "test tafsir",
          },
          {
            ayahNumber: 2,
            verseKey: "2:2",
            uthmaniText: "ذَٰلِكَ الْكِتَابُ",
            wordsJson: null,
            audioUrl: null,
            tafsir: "test tafsir 2",
          },
        ]),
      },
    };
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const bundle = await getSurahBundle(2);
    expect(bundle).not.toBeNull();
    expect(bundle!.id).toBe(2);
    expect(bundle!.name_simple).toBe("Al-Baqara");
    expect(bundle!.ayahs.length).toBe(2);
    expect(bundle!.revelation_place).toBe("madinah");
  });

  it("falls back to external API when DB returns no surah row", async () => {
    const db = {
      surah: { findUnique: vi.fn().mockResolvedValue(null) },
      verse: { findMany: vi.fn().mockResolvedValue([]) },
    };
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        chapter: {
          name_arabic: "الْبَقَرَة",
          name_simple: "Al-Baqara",
          translated_name: { name: "The Cow" },
        },
      }),
    });
    try {
      const bundle = await getSurahBundle(2);
      expect(bundle).not.toBeNull();
      expect(bundle!.name_simple).toBe("Al-Baqara");
      expect(bundle!.ayahs.length).toBe(0);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("falls back to external API when DB throws", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        chapter: {
          name_arabic: "الْبَقَرَة",
          name_simple: "Al-Baqara",
          translated_name: { name: "The Cow" },
        },
      }),
    });
    try {
      const bundle = await getSurahBundle(2);
      expect(bundle).not.toBeNull();
      expect(bundle!.name_simple).toBe("Al-Baqara");
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("returns null when both DB and external API fail for non-fixture surah", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network fail"));
    try {
      const bundle = await getSurahBundle(2);
      expect(bundle).toBeNull();
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});

describe("quran/api — getAvailableSurahs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fixture items when DB has no rows", async () => {
    const db = { surah: { findMany: vi.fn().mockResolvedValue([]) } };
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const items = await getAvailableSurahs();
    expect(items.length).toBeGreaterThanOrEqual(2);
    const ids = items.map((i) => i.id);
    expect(ids).toContain(1);
    expect(ids).toContain(112);
  });

  it("returns DB rows when available", async () => {
    const db = {
      surah: {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, nameArabic: "الفاتحة", nameSimple: "Al-Fatiha", ayahCount: 7 },
          { id: 2, nameArabic: "البقرة", nameSimple: "Al-Baqara", ayahCount: 286 },
        ]),
      },
    };
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const items = await getAvailableSurahs();
    expect(items).toHaveLength(2);
    expect(items[0].name_simple).toBe("Al-Fatiha");
  });

  it("returns fixtures on DB failure", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db fail"));
    const items = await getAvailableSurahs();
    expect(items.length).toBeGreaterThanOrEqual(2);
  });
});
