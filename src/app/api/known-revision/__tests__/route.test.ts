import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/hifz-service", () => ({
  recordKnownRevision: vi.fn(),
}));

import { getSessionUser } from "@/lib/server/auth";
import { recordKnownRevision } from "@/lib/server/hifz-service";
import { POST } from "../route";

function post(body: unknown) {
  return new Request("http://localhost/api/known-revision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/known-revision", () => {
  beforeEach(() => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (recordKnownRevision as ReturnType<typeof vi.fn>).mockReset();
    (recordKnownRevision as ReturnType<typeof vi.fn>).mockResolvedValue({
      revised: 3,
      nextDueAt: "2026-12-05T00:00:00.000Z",
      streak: { current: 2, longest: 4, dailyTargetCount: 10, todayReviewed: 3, todayRead: 0 },
    });
  });

  it("returns 401 when unauthenticated", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(post({ surahId: 1 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when neither surahId nor verseKeys is provided", async () => {
    const res = await POST(post({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 on out-of-range surahId", async () => {
    const res = await POST(post({ surahId: 115 }));
    expect(res.status).toBe(400);
  });

  it("records revision by surahId", async () => {
    const res = await POST(post({ surahId: 67 }));
    expect(res.status).toBe(200);
    expect(recordKnownRevision).toHaveBeenCalledWith({
      userId: "u1",
      surahId: 67,
      verseKeys: undefined,
    });
    const json = (await res.json()) as { ok: boolean; revised: number };
    expect(json.ok).toBe(true);
    expect(json.revised).toBe(3);
  });

  it("records revision by verseKeys", async () => {
    const res = await POST(post({ verseKeys: ["1:1", "1:2"] }));
    expect(res.status).toBe(200);
    expect(recordKnownRevision).toHaveBeenCalledWith({
      userId: "u1",
      surahId: undefined,
      verseKeys: ["1:1", "1:2"],
    });
  });
});
