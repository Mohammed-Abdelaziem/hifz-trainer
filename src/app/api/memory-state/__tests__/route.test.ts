import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/hifz-service", () => ({
  markKnown: vi.fn(),
}));

import { POST } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { markKnown } from "@/lib/server/hifz-service";

function post(body: unknown) {
  return new Request("http://localhost/api/memory-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("/api/memory-state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (markKnown as ReturnType<typeof vi.fn>).mockReset();
    (markKnown as ReturnType<typeof vi.fn>).mockResolvedValue({
      changed: 0,
      created: 0,
      alreadyKnown: 0,
      untouched: 0,
      invalid: 0,
    });
  });

  it("returns 401 for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(post({ verseKeys: ["1:1"], known: true }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid JSON body", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const res = await POST(post("{not json"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when known is not a boolean", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const res = await POST(post({ verseKeys: ["1:1"], known: "yes" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/must be true or false/);
  });

  it("returns 400 when neither verseKeys nor a range is provided", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const res = await POST(post({ known: true }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/verseKeys or a surah range/);
  });

  it("returns 400 for an inverted or out-of-Quran range", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const inverted = await POST(post({ surahId: 112, fromAyah: 4, toAyah: 2, known: true }));
    expect(inverted.status).toBe(400);
    const impossible = await POST(
      post({ surahId: 2, fromAyah: 1, toAyah: 999, known: true })
    );
    expect(impossible.status).toBe(400);
    const badSurah = await POST(post({ surahId: 115, fromAyah: 1, toAyah: 3, known: true }));
    expect(badSurah.status).toBe(400);
  });

  it("returns 400 when verseKeys exceeds the known-mark cap", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    // 287 distinct-looking (but repeated) valid keys exceed the 286 cap; the
    // range path can never hit this cap because Al-Baqarah itself is 286.
    const keys = Array.from({ length: 287 }, () => "1:1");
    const res = await POST(post({ verseKeys: keys, known: true }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/at most \d+ verses at a time/);
  });

  it("expands a surah range into verse keys and calls the service", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const res = await POST(
      post({ surahId: 112, fromAyah: 1, toAyah: 3, known: true })
    );
    expect(res.status).toBe(200);
    expect(markKnown).toHaveBeenCalledWith({
      userId: "u1",
      verseKeys: ["112:1", "112:2", "112:3"],
      known: true,
    });
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("filters malformed keys out of verseKeys and rejects an all-invalid list", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const res = await POST(
      post({ verseKeys: ["2:255", "b2:255", "2:255x", ""], known: true })
    );
    expect(res.status).toBe(200);
    expect(markKnown).toHaveBeenCalledWith({
      userId: "u1",
      verseKeys: ["2:255"],
      known: true,
    });

    (markKnown as ReturnType<typeof vi.fn>).mockClear();
    const bad = await POST(post({ verseKeys: ["nope"], known: true }));
    expect(bad.status).toBe(400);
    expect(markKnown).not.toHaveBeenCalled();
  });

  it("returns 500 when the service fails", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (markKnown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("down"));
    const res = await POST(post({ verseKeys: ["1:1"], known: true }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Failed to update/);
  });
});
