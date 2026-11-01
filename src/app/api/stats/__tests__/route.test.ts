import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET, buildRecap } from "../route";
import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";

/** Full db mock covering everything GET /api/stats + getAchievementSnapshot touch. */
function makeDb(logs: unknown[], reads: unknown[] = []) {
  return {
    user: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "u1", currentStreak: 0, longestStreak: 0, dailyTargetCount: 10 }) },
    reviewLog: {
      findMany: vi.fn().mockResolvedValue(logs),
      count: vi.fn().mockResolvedValue(logs.length),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    readingLog: { findMany: vi.fn().mockResolvedValue(reads) },
    userMemoryState: { findMany: vi.fn().mockResolvedValue([]) },
    verse: { groupBy: vi.fn().mockResolvedValue([]) },
    surah: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe("/api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns real stats for authenticated users", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    // Anchor fixtures to "now" so the rolling activeDays window never
    // silently ages them out.
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const db = makeDb([
      { createdAt: new Date(now - 1 * day), grade: "GOOD", verseKey: "1:1", reviewDurationMs: 5000, intervalDays: 3, scheduler: "sm2" },
      { createdAt: new Date(now - 2 * day), grade: "AGAIN", verseKey: "1:2", reviewDurationMs: 2000, intervalDays: 1, scheduler: "fsrs" },
    ]);
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

  it("derives xp, recap and achievements from the same ledger", async () => {
    (getSessionUser as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u1" });
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const db = makeDb([
      { createdAt: new Date(now - 1 * day), grade: "EASY", verseKey: "2:255", reviewDurationMs: 9000, intervalDays: 12, scheduler: "sm2" },
    ]);
    // The all-time XP aggregation rides reviewLog.groupBy, not findMany.
    db.reviewLog.groupBy.mockResolvedValue([{ grade: "EASY", _count: { _all: 1 } }]);
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(db);

    const res = await GET();
    const data = await res.json();
    expect(data.xp.totalXp).toBe(6);
    expect(data.xp.level).toBe(1);
    expect(data.recap.reviewsThisWeek).toBe(1);
    expect(data.recap.reviewsLastWeek).toBe(0);
    expect(data.recap.activeDaysThisWeek).toBe(1);
    expect(data.recap.xpThisWeek).toBe(6);
    expect(data.achievements.some((a: { id: string; earned: boolean }) => a.id === "streak-3" && !a.earned)).toBe(true);
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

describe("buildRecap", () => {
  const today = new Date("2026-11-01T12:00:00Z");
  const names = new Map<number, string>([[1, "Al-Fatihah"], [2, "Al-Baqara"]]);
  const log = (daysAgo: number, verseKey = "1:1", grade = "GOOD") => ({
    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    verseKey,
    grade,
  });

  it("separates this week from last week", () => {
    const recap = buildRecap([log(0), log(3), log(7), log(10)], today, names);
    expect(recap.reviewsThisWeek).toBe(2);
    expect(recap.reviewsLastWeek).toBe(2);
    expect(recap.activeDaysThisWeek).toBe(2);
  });

  it("picks the best day and the top surah by name", () => {
    const recap = buildRecap(
      [log(0), log(0), log(0), log(2, "2:1"), log(2, "2:2"), log(5, "2:255"), log(6, "2:3")],
      today,
      names
    );
    expect(recap.bestDay?.count).toBe(3);
    expect(recap.topSurah?.surahId).toBe(2);
    expect(recap.topSurah?.name).toBe("Al-Baqara");
    expect(recap.topSurah?.count).toBe(4);
  });

  it("scores xpThisWeek from grade weights", () => {
    const recap = buildRecap([log(0, "1:1", "EASY"), log(0, "1:2", "AGAIN")], today, names);
    expect(recap.xpThisWeek).toBe(7);
  });

  it("all-zero recap when the ledger is empty", () => {
    const recap = buildRecap([], today, names);
    expect(recap.reviewsThisWeek).toBe(0);
    expect(recap.reviewsLastWeek).toBe(0);
    expect(recap.bestDay).toBeNull();
    expect(recap.topSurah).toBeNull();
  });
});
