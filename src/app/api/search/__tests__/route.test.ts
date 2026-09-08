import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET } from "@/app/api/search/route";
import { getDb } from "@/lib/db";

function makeRequest(q: string | null, limit?: string) {
  const url = new URL("http://localhost/api/search");
  if (q !== null) url.searchParams.set("q", q);
  if (limit) url.searchParams.set("limit", limit);
  return new Request(url.toString());
}

const mockDb = {
  verse: {
    findMany: vi.fn().mockResolvedValue([]),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);
  mockDb.verse.findMany.mockResolvedValue([]);
});

describe("/api/search", () => {
  it("returns empty results for query shorter than 2 chars", async () => {
    const res = await GET(makeRequest("a"));
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(body.query).toBe("a");
  });

  it("returns empty results for null query", async () => {
    const res = await GET(makeRequest(null));
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(body.query).toBe("");
  });

  it("returns empty results for whitespace-only query", async () => {
    const res = await GET(makeRequest("   "));
    const body = await res.json();
    expect(body.results).toEqual([]);
  });

  it("queries DB with verseKey contains", async () => {
    mockDb.verse.findMany.mockResolvedValue([]);
    await GET(makeRequest("2:255"));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ verseKey: expect.objectContaining({ contains: "2:255" }) }),
          ]),
        }),
      })
    );
  });

  it("returns matching verses with snippet", async () => {
    mockDb.verse.findMany.mockResolvedValue([
      {
        verseKey: "2:255",
        surahId: 2,
        ayahNumber: 255,
        wordsJson: JSON.stringify([
          { text_uthmani: "اللَّهُ", translation: "Allah" },
          { text_uthmani: "لَا", translation: "there is no" },
          { text_uthmani: "إِلَٰهَ", translation: "deity" },
        ]),
      },
    ]);
    const res = await GET(makeRequest("Allah"));
    const body = await res.json();
    expect(body.results).toHaveLength(1);
    expect(body.results[0].verseKey).toBe("2:255");
    expect(body.results[0].snippet).toContain("Allah");
  });

  it("generates snippet with ellipsis when match is not at start", async () => {
    const longTranslation = "A".repeat(80) + "target word" + "B".repeat(80);
    const words = longTranslation.split(" ").map((w, i) => ({
      text_uthmani: `word${i}`,
      translation: w,
    }));
    mockDb.verse.findMany.mockResolvedValue([
      {
        verseKey: "1:1",
        surahId: 1,
        ayahNumber: 1,
        wordsJson: JSON.stringify(words),
      },
    ]);
    const res = await GET(makeRequest("target"));
    const body = await res.json();
    expect(body.results[0].snippet).toMatch(/^\.\.\./);
    expect(body.results[0].snippet).toContain("target");
  });

  it("generates snippet truncated at 100 chars when no match found in translation", async () => {
    mockDb.verse.findMany.mockResolvedValue([
      {
        verseKey: "1:1",
        surahId: 1,
        ayahNumber: 1,
        wordsJson: JSON.stringify([
          { text_uthmani: "test", translation: "A".repeat(200) },
        ]),
      },
    ]);
    const res = await GET(makeRequest("xyz"));
    const body = await res.json();
    expect(body.results[0].snippet.length).toBeLessThanOrEqual(104);
    expect(body.results[0].snippet).toContain("...");
  });

  it("handles empty wordsJson gracefully", async () => {
    mockDb.verse.findMany.mockResolvedValue([
      { verseKey: "1:1", surahId: 1, ayahNumber: 1, wordsJson: null },
    ]);
    const res = await GET(makeRequest("test"));
    const body = await res.json();
    expect(body.results[0].snippet).toBe("");
  });

  it("handles malformed wordsJson gracefully", async () => {
    mockDb.verse.findMany.mockResolvedValue([
      { verseKey: "1:1", surahId: 1, ayahNumber: 1, wordsJson: "not json" },
    ]);
    const res = await GET(makeRequest("test"));
    const body = await res.json();
    expect(body.results[0].snippet).toBe("");
  });

  it("caps limit at 50", async () => {
    await GET(makeRequest("test", "100"));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("uses default limit of 20", async () => {
    await GET(makeRequest("test"));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    );
  });

  it("returns empty results on DB failure", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
    const res = await GET(makeRequest("test"));
    const body = await res.json();
    expect(body.results).toEqual([]);
  });

  it("trims query whitespace", async () => {
    await GET(makeRequest("  test  "));
    expect(mockDb.verse.findMany).toHaveBeenCalled();
  });
});
