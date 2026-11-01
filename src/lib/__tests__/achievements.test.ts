import { describe, expect, it } from "vitest";
import { countEarned, evaluateAchievements } from "../achievements";

const base = {
  totalReviews: 0,
  versesKnown: 0,
  surahsKnown: 0,
  streakCurrent: 0,
  streakLongest: 0,
};

describe("evaluateAchievements", () => {
  it("all unearned on an empty snapshot, each with progress", () => {
    const out = evaluateAchievements(base);
    expect(countEarned(out)).toBe(0);
    expect(out.every((a) => !a.earned && a.progress?.current === 0)).toBe(true);
  });

  it("marks streak tiers earned and keeps higher tiers pending", () => {
    const out = evaluateAchievements({ ...base, streakCurrent: 7, streakLongest: 7 });
    const earnedIds = out.filter((a) => a.earned).map((a) => a.id);
    expect(earnedIds).toEqual(["streak-3", "streak-7"]);
  });

  it("surahs and verses plateau independently", () => {
    const out = evaluateAchievements({ ...base, versesKnown: 100, surahsKnown: 1, totalReviews: 50 });
    const earned = out.filter((a) => a.earned).map((a) => a.id).sort();
    expect(earned).toEqual(["reviews-50", "surah-1", "verses-10", "verses-100"]);
  });

  it("earned badges expose no progress object", () => {
    const out = evaluateAchievements({ ...base, streakLongest: 100 });
    const century = out.find((a) => a.id === "longest-100")!;
    expect(century.earned).toBe(true);
    expect(century.progress).toBeUndefined();
  });

  it("is idempotent", () => {
    const s = { ...base, totalReviews: 500, versesKnown: 42, surahsKnown: 3, streakCurrent: 8, streakLongest: 20 };
    expect(evaluateAchievements(s)).toEqual(evaluateAchievements(s));
  });
});
