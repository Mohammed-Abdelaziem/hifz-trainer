import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/guest", () => ({
  isGuestSession: vi.fn(),
}));

vi.mock("@/lib/server/hifz-service", () => ({
  recordReview: vi.fn(),
}));

import { POST } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { recordReview } from "@/lib/server/hifz-service";

describe("/api/reviews/sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("POST returns ok:synced:0 for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/reviews/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews: [{ verseKey: "1:1", grade: "GOOD" }] }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.synced).toBe(0);
    expect(recordReview).not.toHaveBeenCalled();
  });

  it("POST syncs reviews for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (recordReview as ReturnType<typeof vi.fn>).mockResolvedValue({ result: "ok" });

    const req = new Request("http://localhost/api/reviews/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviews: [
          { verseKey: "1:1", grade: "GOOD" },
          { verseKey: "1:2", grade: "HARD" },
        ],
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.synced).toBe(2);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].ok).toBe(true);
    expect(recordReview).toHaveBeenCalledTimes(2);
  });

  it("POST returns 400 for missing reviews array", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const req = new Request("http://localhost/api/reviews/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST handles individual review failures gracefully", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (recordReview as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ result: "ok" })
      .mockRejectedValueOnce(new Error("fail"));

    const req = new Request("http://localhost/api/reviews/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviews: [
          { verseKey: "1:1", grade: "GOOD" },
          { verseKey: "1:2", grade: "HARD" },
        ],
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.synced).toBe(1);
    expect(data.failed).toBe(1);
    expect(data.results[0].ok).toBe(true);
    expect(data.results[1].ok).toBe(false);
  });
});
