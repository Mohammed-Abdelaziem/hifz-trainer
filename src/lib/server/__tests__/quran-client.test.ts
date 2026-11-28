import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchVersesByChapter } from "../quran-client";

describe("quran-client — fetchVersesByChapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("paginates through all pages when a surah exceeds Quran.com's 50-verse per_page cap", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      const page = Number(new URL(url).searchParams.get("page") ?? "1");
      const verses =
        page === 1
          ? [
              { verse_key: "2:1", verse_number: 1, page_number: 2, text_uthmani: "الم" },
              { verse_key: "2:50", verse_number: 50, page_number: 8, text_uthmani: "..." },
            ]
          : page === 2
            ? [{ verse_key: "2:51", verse_number: 51, page_number: 8, text_uthmani: "..." }]
            : [{ verse_key: "2:286", verse_number: 286, page_number: 49, text_uthmani: "..." }];
      return Promise.resolve(
        new Response(
          JSON.stringify({
            verses,
            pagination: { current_page: page, total_pages: 3, per_page: 50 },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    });
    vi.stubGlobal("fetch", mockFetch);

    const verses = await fetchVersesByChapter(2, { backoffMs: 0 });
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(verses.map((v) => v.verse_key)).toEqual(["2:1", "2:50", "2:51", "2:286"]);
  });

  it("makes a single request when total_pages is 1 or omitted", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          verses: [{ verse_key: "112:1", verse_number: 1, text_uthmani: "قل هو الله أحد" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", mockFetch);

    const verses = await fetchVersesByChapter(112, { backoffMs: 0 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(verses).toHaveLength(1);
  });
});
