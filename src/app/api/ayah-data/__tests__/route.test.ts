import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/ayah-data", () => ({
  getOrFetchAyahData: vi.fn(),
}));

import { GET } from "../route";
import { getOrFetchAyahData } from "@/lib/server/ayah-data";

describe("/api/ayah-data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ayah data for valid verse key", async () => {
    (getOrFetchAyahData as ReturnType<typeof vi.fn>).mockResolvedValue({
      verseKey: "1:1",
      words: [{ id: "1:1:1", text_uthmani: "بِسْمِ", position: 1 }],
      audioUrl: "https://example.com/001001.mp3",
      tafsir: "In the name of Allah",
    });
    const url = new URL("http://localhost/api/ayah-data?verseKey=1:1");
    const req = new Request(url.toString());
    const res = await GET(req);
    const data = await res.json();
    expect(data.verseKey).toBe("1:1");
    expect(data.words).toHaveLength(1);
  });

  it("returns 400 for missing verseKey", async () => {
    const url = new URL("http://localhost/api/ayah-data");
    const req = new Request(url.toString());
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid verseKey format", async () => {
    const url = new URL("http://localhost/api/ayah-data?verseKey=invalid");
    const req = new Request(url.toString());
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 502 on fetch failure", async () => {
    (getOrFetchAyahData as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network fail"));
    const url = new URL("http://localhost/api/ayah-data?verseKey=1:1");
    const req = new Request(url.toString());
    const res = await GET(req);
    expect(res.status).toBe(502);
  });
});
