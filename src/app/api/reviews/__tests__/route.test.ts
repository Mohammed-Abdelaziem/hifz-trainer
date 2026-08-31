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

describe("/api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("returns ok for unauthenticated users (no-op)", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey: "1:1", grade: "GOOD", durationMs: 5000 }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.guest).toBe(true);
    expect(recordReview).not.toHaveBeenCalled();
  });

  it("validates verseKey format", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const req = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey: "invalid", grade: "GOOD" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("validates grade value", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const req = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey: "1:1", grade: "INVALID" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("calls recordReview with object for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (recordReview as ReturnType<typeof vi.fn>).mockResolvedValue({ result: "ok" });

    const req = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey: "1:1", grade: "GOOD", durationMs: 5000 }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(recordReview).toHaveBeenCalledWith({
      userId: "u1",
      verseKey: "1:1",
      grade: "GOOD",
      durationMs: 5000,
    });
  });

  it("passes durationMs as undefined when not provided", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (recordReview as ReturnType<typeof vi.fn>).mockResolvedValue({ result: "ok" });

    const req = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKey: "2:255", grade: "EASY" }),
    });
    await POST(req);
    expect(recordReview).toHaveBeenCalledWith({
      userId: "u1",
      verseKey: "2:255",
      grade: "EASY",
      durationMs: undefined,
    });
  });
});
