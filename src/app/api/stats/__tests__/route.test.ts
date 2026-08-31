import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/server/guest", () => ({
  isGuestSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { getDb } from "@/lib/db";

describe("/api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("returns zeroed stats for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.totalReviews).toBe(0);
    expect(data.activeDays).toBe(0);
    expect(data.grades.AGAIN).toBe(0);
    expect(data.schedulerCompare.buckets).toHaveLength(5);
  });

  it("returns real stats for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const db = {
      reviewLog: {
        findMany: vi.fn().mockResolvedValue([
          { createdAt: new Date("2026-08-30T10:00:00Z"), grade: "GOOD", reviewDurationMs: 5000, intervalDays: 3, scheduler: "sm2" },
          { createdAt: new Date("2026-08-29T10:00:00Z"), grade: "AGAIN", reviewDurationMs: 2000, intervalDays: 1, scheduler: "fsrs" },
        ]),
      },
    };
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const res = await GET();
    const data = await res.json();
    expect(data.totalReviews).toBe(2);
    expect(data.activeDays).toBe(2);
    expect(data.grades.GOOD).toBe(1);
    expect(data.grades.AGAIN).toBe(1);
    expect(data.schedulerCompare.sm2[1]).toBe(1); // 1–3d bucket (intervalDays=3)
    expect(data.schedulerCompare.fsrs[0]).toBe(1); // ≤1d bucket
    expect(data.schedulerCompare.totals.sm2).toBe(1);
    expect(data.schedulerCompare.totals.fsrs).toBe(1);
  });

  it("returns 500 when DB throws", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db crash"));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to load stats");
  });
});
