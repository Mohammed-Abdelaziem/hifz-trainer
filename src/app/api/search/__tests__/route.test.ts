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
  // Readiness probe: the fast path needs pg_trgm *and* the VerseSearch table.
  // Both reported present so the fast path is the default under test.
  $queryRaw: vi.fn().mockResolvedValue([{ hasExt: true, hasTable: true }]),
};

beforeEach(() => {
  vi.clearAllMocks();
  (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);
  mockDb.verse.findMany.mockResolvedValue([]);
  mockDb.$queryRaw.mockResolvedValue([{ hasExt: true, hasTable: true }]);
});

/** Forces the readiness probe to report the fast path as unusable. */
function useFallbackPath(hasExt = false, hasTable = false) {
  mockDb.$queryRaw.mockResolvedValueOnce([{ hasExt, hasTable }]);
}

describe("/api/search", () => {
  it("returns empty results for query shorter than 2 chars", async () => {
    const res = await GET(makeRequest("a"));
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(body.query).toBe("a");
  });

  it("falls back to the default limit when limit is not a number", async () => {
    // Math.min(NaN, 50) is NaN, which Prisma rejects as `take` and 500s.
    mockDb.$queryRaw.mockResolvedValueOnce([{ hasExt: true, hasTable: true }]); // readiness probe
    mockDb.$queryRaw.mockResolvedValueOnce([]); // search query
    await GET(makeRequest("rahman", "abc"));
    expect(mockDb.verse.findMany).not.toHaveBeenCalled();
  });

  it("falls back to the verse table when pg_trgm is unavailable", async () => {
    useFallbackPath();
    mockDb.verse.findMany.mockResolvedValue([]);
    await GET(makeRequest("rahman", "-5"));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 })
    );

    useFallbackPath();
    await GET(makeRequest("rahman", "9999"));
    expect(mockDb.verse.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("falls back when pg_trgm exists but the VerseSearch table does not", async () => {
    // pg_trgm can be installed while 20260930000000_verse_search has not been
    // applied. Probing only the extension made the fast-path query throw and
    // the route return 500 instead of degrading.
    useFallbackPath(true, false);
    mockDb.verse.findMany.mockResolvedValue([]);
    const res = await GET(makeRequest("rahman"));
    expect(res.status).toBe(200);
    expect(mockDb.verse.findMany).toHaveBeenCalled();
  });

  it("falls back when the fast-path query throws", async () => {
    // A partially applied migration leaves the table present but without the
    // expected column, so readiness passes and the query still fails.
    mockDb.$queryRaw.mockResolvedValueOnce([{ hasExt: true, hasTable: true }]);
    mockDb.$queryRaw.mockRejectedValueOnce(new Error('column "textNormalized" does not exist'));
    mockDb.verse.findMany.mockResolvedValue([]);
    const res = await GET(makeRequest("rahman"));
    expect(res.status).toBe(200);
    expect(mockDb.verse.findMany).toHaveBeenCalled();
  });

  it("normalizes the query so unvocalized Arabic matches vocalized text", async () => {
    mockDb.$queryRaw.mockResolvedValueOnce([{ hasExt: true, hasTable: true }]);
    mockDb.$queryRaw.mockResolvedValueOnce([]);

    await GET(makeRequest("لا إله إلا"));

    // The second $queryRaw call is the search itself. Read the interpolated
    // parameter out of the tagged-template arguments.
    const searchArgs = mockDb.$queryRaw.mock.calls[1];
    const literals = searchArgs[0] as TemplateStringsArray;
    const values = searchArgs.slice(1);
    const pattern = values.find((v) => typeof v === "string" && v.includes("%"));
    expect(pattern).toBe("%لا اله الا%");
    // Diacritics and the folded alef are gone from the pattern itself.
    expect(literals.join("?")).toContain("textNormalized");
  });

  it("escapes LIKE wildcards so a query cannot inject them", async () => {
    mockDb.$queryRaw.mockResolvedValueOnce([{ hasExt: true, hasTable: true }]);
    mockDb.$queryRaw.mockResolvedValueOnce([]);
    await GET(makeRequest("100% pure"));
    const values = mockDb.$queryRaw.mock.calls[1].slice(1);
    const pattern = values.find((v) => typeof v === "string" && v.includes("%"));
    expect(pattern).toBe("%100\\% pure%");
  });

  it("rejects an over-long query without touching the database", async () => {
    const res = await GET(makeRequest("a".repeat(200)));
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(mockDb.verse.findMany).not.toHaveBeenCalled();
    expect(mockDb.$queryRaw).not.toHaveBeenCalled();
  });

  it("returns a snippet from the field that actually matched", async () => {
    mockDb.$queryRaw.mockResolvedValueOnce([{ hasExt: true, hasTable: true }]);
    mockDb.$queryRaw.mockResolvedValueOnce([
      {
        verseKey: "2:255",
        surahId: 2,
        ayahNumber: 255,
        wordsJson: JSON.stringify([
          { text_uthmani: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ", translation: "Allah — there is no deity except Him" },
        ]),
      },
    ]);

    const res = await GET(makeRequest("الله"));
    const body = await res.json();
    expect(body.results).toHaveLength(1);
    // The Arabic matched, so the snippet must be Arabic, not the English.
    expect(body.results[0].snippet).toContain("اللَّهُ");
    expect(body.results[0].snippet).not.toContain("there is no deity");
  });

  it("falls back to the verse table when the probe throws", async () => {
    mockDb.$queryRaw.mockRejectedValueOnce(new Error("no such extension"));
    mockDb.verse.findMany.mockResolvedValue([]);
    const res = await GET(makeRequest("rahman"));
    expect(res.status).toBe(200);
    expect(mockDb.verse.findMany).toHaveBeenCalled();
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

  it("returns matching verses with snippet", async () => {
    useFallbackPath();
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
    useFallbackPath();
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
    expect(body.results[0].snippet).toMatch(/^…|^\.\.\./);
    expect(body.results[0].snippet).toContain("target");
  });

  it("generates snippet truncated at 100 chars when no match found in translation", async () => {
    useFallbackPath();
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
    expect(body.results[0].snippet).toContain("…");
  });

  it("handles empty wordsJson gracefully", async () => {
    useFallbackPath();
    mockDb.verse.findMany.mockResolvedValue([
      { verseKey: "1:1", surahId: 1, ayahNumber: 1, wordsJson: null },
    ]);
    const res = await GET(makeRequest("test"));
    const body = await res.json();
    expect(body.results[0].snippet).toBe("");
  });

  it("handles malformed wordsJson gracefully", async () => {
    useFallbackPath();
    mockDb.verse.findMany.mockResolvedValue([
      { verseKey: "1:1", surahId: 1, ayahNumber: 1, wordsJson: "not json" },
    ]);
    const res = await GET(makeRequest("test"));
    const body = await res.json();
    expect(body.results[0].snippet).toBe("");
  });

  it("caps limit at 50", async () => {
    useFallbackPath();
    await GET(makeRequest("test", "100"));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("uses default limit of 20", async () => {
    useFallbackPath();
    await GET(makeRequest("test"));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    );
  });

  it("returns 500 on DB failure", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
    const res = await GET(makeRequest("test"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Search failed");
  });

  it("trims query whitespace", async () => {
    useFallbackPath();
    await GET(makeRequest("  test  "));
    expect(mockDb.verse.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ wordsJson: expect.objectContaining({ contains: "test" }) }),
      })
    );
  });
});
