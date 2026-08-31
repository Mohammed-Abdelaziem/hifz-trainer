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

vi.mock("@/lib/server/hifz-service", () => ({
  buildDailyQueue: vi.fn(),
}));

import { GET } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { buildDailyQueue } from "@/lib/server/hifz-service";

describe("/api/queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGuestSession as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it("returns empty queue for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.sabaq).toEqual([]);
    expect(data.sabqi).toEqual([]);
    expect(data.manzil).toEqual([]);
    expect(data.estimatedMinutes).toBe(0);
  });

  it("returns empty queue when DB throws", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db down"));
    const res = await GET();
    const data = await res.json();
    expect(data.sabaq).toEqual([]);
  });

  it("returns actual queue for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const fakeQueue = {
      sabaq: [{ verseKey: "1:1" }],
      sabqi: [],
      manzil: [],
      estimatedMinutes: 2,
      scheduler: "sm2" as const,
      requestRetention: 0.9,
      streak: { current: 3, longest: 10, dailyTargetCount: 5, todayReviewed: 2 },
    };
    (buildDailyQueue as ReturnType<typeof vi.fn>).mockResolvedValue(fakeQueue);

    const res = await GET();
    const data = await res.json();
    expect(data.sabaq).toHaveLength(1);
    expect(data.streak.current).toBe(3);
    expect(buildDailyQueue).toHaveBeenCalledWith("u1");
  });

  it("returns empty queue when buildDailyQueue throws", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    (buildDailyQueue as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("db fail"));
    const res = await GET();
    const data = await res.json();
    expect(data.sabaq).toEqual([]);
  });
});
