import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

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
    // The fixture path still asks the live Quran API for fresh metadata when
    // the DB is unavailable, so a slow host flaked these tests under the
    // parallel suite (5s timeout < the API's 6s fetch budget). Forcing fetch
    // to fail pins the suite to the deterministic fixture fallback; the
    // network path itself is covered by the dedicated mock test below.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network disabled in unit tests")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns fixture for surah 1 (Al-Fatiha)", async () => {
    const bundle = await getSurahBundle(1);
    expect(bundle).not.toBeNull();
    expect(bundle!.id).toBe(1);
    expect(bundle!.ayahs.length).toBe(7);
    expect(bundle!.ayahs[0].verse_key).toBe("1:1");
    expect(bundle!.ayahs[0].translation).toBe(
      "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    );
  });

  it("returns fixture for surah 112 (Al-Ikhlas)", async () => {
    const bundle = await getSurahBundle(112);
    expect(bundle).not.toBeNull();
    expect(bundle!.id).toBe(112);
    expect(bundle!.ayahs.length).toBe(4);
  });

  it("returns null for surah 0 (invalid)", async () => {
    const bundle = await getSurahBundle(0);
    expect(bundle).toBeNull();
  });

  it("returns null for negative surahId", async () => {
    const bundle = await getSurahBundle(-1);
    expect(bundle).toBeNull();
  });

  it("returns null for surahId > 114", async () => {
    const bundle = await getSurahBundle(115);
    expect(bundle).toBeNull();
  });

  it("still returns fixture even if fetchChapterMeta fails", async () => {
    // beforeEach already stubs fetch to a rejected promise.
    const bundle = await getSurahBundle(1);
    expect(bundle).not.toBeNull();
    expect(bundle!.id).toBe(1);
    expect(bundle!.ayahs.length).toBe(7);
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
          translation: "Alif, Lam, Meem.",
        },
        {
          ayahNumber: 2,
          verseKey: "2:2",
          uthmaniText: "ذَٰلِكَ الْكِتَابُ",
          wordsJson: null,
          audioUrl: null,
          tafsir: "test tafsir 2",
          translation: "This is the Book about which there is no doubt,",
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
    expect(bundle!.ayahs[0].translation).toBe("Alif, Lam, Meem.");
    expect(bundle!.ayahs[1].translation).toBe("This is the Book about which there is no doubt,");
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

  it("degrades to an empty bundle instead of null when every source fails", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network fail"));
    try {
      const bundle = await getSurahBundle(2);
      expect(bundle).not.toBeNull();
      expect(bundle!.id).toBe(2);
      expect(bundle!.ayahs).toHaveLength(0);
      expect(bundle!.name_simple).toBe("Surah 2");
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("retries the DB before giving up", async () => {
    let attempts = 0;
    (getDb as ReturnType<typeof vi.fn>).mockImplementation(() => {
      attempts++;
      if (attempts === 1) return Promise.reject(new Error("cold connection"));
      return Promise.resolve({
        surah: {
          findUnique: vi.fn().mockResolvedValue({
            id: 3,
            nameArabic: "ال عمران",
            nameSimple: "Aal-Imran",
            englishName: "The Family of Imran",
            revelationPlace: "madinah",
            ayahCount: 1,
          }),
        },
        verse: {
          findMany: vi.fn().mockResolvedValue([
            {
              ayahNumber: 1,
              verseKey: "3:1",
              uthmaniText: "الم",
              wordsJson: null,
              audioUrl: null,
              tafsir: null,
            },
          ]),
        },
      });
    });

    const bundle = await getSurahBundle(3);
    expect(attempts).toBe(2);
    expect(bundle!.name_simple).toBe("Aal-Imran");
    expect(bundle!.ayahs).toHaveLength(1);
  });

  it("retries the upstream verses request once", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));

    let verseCalls = 0;
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation((input: string) => {
      if (input.includes("/verses/by_chapter/")) {
        verseCalls++;
        if (verseCalls === 1) return Promise.reject(new Error("network blip"));
        return Promise.resolve({
          ok: true,
          json: async () => ({
            verses: [
              {
                verse_key: "2:1",
                verse_number: 1,
                text_uthmani: "الم",
                words: [
                  {
                    position: 1,
                    char_type_name: "word",
                    text_uthmani: "الم",
                    audio_url: null,
                    translation: null,
                    transliteration: null,
                  },
                ],
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          chapter: {
            name_arabic: "الْبَقَرَة",
            name_simple: "Al-Baqara",
            translated_name: { name: "The Cow" },
          },
        }),
      });
    });

    try {
      const bundle = await getSurahBundle(2);
      expect(verseCalls).toBe(2);
      expect(bundle!.ayahs).toHaveLength(1);
      expect(bundle!.ayahs[0].verse_key).toBe("2:1");
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("maps upstream English translations onto the bundle", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation((input: string) => {
      if (input.includes("/verses/by_chapter/")) {
        expect(input).toContain("translations=131");
        return Promise.resolve({
          ok: true,
          json: async () => ({
            verses: [
              {
                verse_key: "2:1",
                verse_number: 1,
                text_uthmani: "الم",
                translations: [{ resource_id: 131, text: "Alif, Lam, Meem." }],
                words: [
                  {
                    position: 1,
                    char_type_name: "word",
                    text_uthmani: "الم",
                    audio_url: null,
                    translation: null,
                    transliteration: null,
                  },
                ],
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          chapter: {
            name_arabic: "الْبَقَرَة",
            name_simple: "Al-Baqara",
            translated_name: { name: "The Cow" },
          },
        }),
      });
    });

    try {
      const bundle = await getSurahBundle(2);
      expect(bundle!.ayahs).toHaveLength(1);
      expect(bundle!.ayahs[0].translation).toBe("Alif, Lam, Meem.");
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("returns null for surah 115 (beyond valid range)", async () => {
    const bundle = await getSurahBundle(115);
    expect(bundle).toBeNull();
  });

  it("returns null for surah -5 (negative)", async () => {
    const bundle = await getSurahBundle(-5);
    expect(bundle).toBeNull();
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
