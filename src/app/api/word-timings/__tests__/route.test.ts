import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/fetch-json", () => ({
  fetchJson: vi.fn(),
}));

import { GET } from "../route";
import { fetchJson } from "@/lib/server/fetch-json";

const mockedFetchJson = fetchJson as unknown as ReturnType<typeof vi.fn>;

function req(query: string) {
  return new Request(new URL(`http://localhost/api/word-timings?${query}`).toString());
}

describe("/api/word-timings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns merged timings keyed by verse", async () => {
    mockedFetchJson.mockResolvedValue({
      audio_files: [
        {
          verse_key: "1:1",
          segments: [
            [0, 1, 60, 610],
            [1, 2, 620, 1310],
            [2, 3, 1320, 2450],
            [3, 4, 2460, 5970],
          ],
        },
      ],
    });

    const res = await GET(req("surah=1&reciter=7"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.surah).toBe(1);
    expect(data.reciterId).toBe(7);
    expect(data.timings["1:1"]).toEqual([
      [0, 60, 610],
      [1, 620, 1310],
      [2, 1320, 2450],
      [3, 2460, 5970],
    ]);
  });

  it("merges repeated segments for the same word", async () => {
    mockedFetchJson.mockResolvedValue({
      audio_files: [
        {
          verse_key: "2:2",
          segments: [
            [0, 1, 150, 500],
            [0, 1, 520, 860],
            [1, 2, 870, 1820],
          ],
        },
      ],
    });

    const res = await GET(req("surah=2&reciter=7"));
    const data = await res.json();
    expect(data.timings["2:2"]).toEqual([
      [0, 150, 860],
      [1, 870, 1820],
    ]);
  });

  it("omits verses with no segments", async () => {
    mockedFetchJson.mockResolvedValue({
      audio_files: [
        { verse_key: "2:1", segments: [[0, 1, 30, 7080]] },
        { verse_key: "2:2" },
      ],
    });

    const res = await GET(req("surah=2&reciter=7"));
    const data = await res.json();
    expect(data.timings["2:1"]).toHaveLength(1);
    expect(data.timings["2:2"]).toBeUndefined();
  });

  it("returns empty timings when the upstream has none", async () => {
    mockedFetchJson.mockResolvedValue({ audio_files: [{ verse_key: "1:1" }] });

    const res = await GET(req("surah=1&reciter=7"));
    const data = await res.json();
    expect(data.timings).toEqual({});
  });

  it("returns 400 for a missing surah", async () => {
    const res = await GET(req("reciter=7"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an out-of-range surah", async () => {
    expect((await GET(req("surah=0"))).status).toBe(400);
    expect((await GET(req("surah=115"))).status).toBe(400);
    expect((await GET(req("surah=abc"))).status).toBe(400);
  });

  it("falls back to the default reciter for unknown ids", async () => {
    mockedFetchJson.mockResolvedValue({ audio_files: [] });

    const res = await GET(req("surah=1&reciter=999"));
    const data = await res.json();
    expect(data.reciterId).toBe(7);
  });

  it("requests the chapter endpoint with segments", async () => {
    mockedFetchJson.mockResolvedValue({ audio_files: [] });

    await GET(req("surah=18&reciter=7"));
    expect(mockedFetchJson).toHaveBeenCalledWith(
      expect.stringContaining("/recitations/7/by_chapter/18"),
      expect.anything()
    );
    expect(mockedFetchJson.mock.calls[0][0]).toContain("fields=segments");
  });

  it("returns 502 when the upstream request fails", async () => {
    mockedFetchJson.mockRejectedValue(new Error("network fail"));

    const res = await GET(req("surah=1&reciter=7"));
    expect(res.status).toBe(502);
  });
});
