import { describe, expect, it } from "vitest";
import { stabilityColor, stabilityScore } from "@/lib/srs/stability";

describe("stabilityScore", () => {
  it("returns null for untracked verses", () => {
    expect(stabilityScore(null, 0, null)).toBeNull();
  });

  it("scores brand-new verses near the floor", () => {
    expect(stabilityScore("SABAQ", 0, null)).toBe(4);
  });

  it("returns 4 for intervalDays <= 0", () => {
    expect(stabilityScore("SABQI", 0, null)).toBe(4);
    expect(stabilityScore("SABQI", -1, null)).toBe(4);
  });

  it("grows monotonically with interval length", () => {
    const oneDay = stabilityScore("SABQI", 1, new Date());
    const oneWeek = stabilityScore("SABQI", 7, new Date());
    const twoMonths = stabilityScore("MANZIL", 60, new Date());
    expect(oneWeek!).toBeGreaterThan(oneDay!);
    expect(twoMonths!).toBeGreaterThan(oneWeek!);
    expect(twoMonths!).toBeLessThanOrEqual(100);
  });

  it("decays when overdue but never below the clamp", () => {
    const now = new Date("2026-08-26T00:00:00Z");
    const due = new Date(now.getTime() - 40 * 86_400_000);
    const fresh = stabilityScore("SABQI", 10, now, now);
    const decayed = stabilityScore("SABQI", 10, due, now);
    expect(decayed!).toBeLessThan(fresh!);
    expect(decayed!).toBeGreaterThanOrEqual(2);
  });

  it("does not decay when dueDate is in the future", () => {
    const now = new Date("2026-08-26T00:00:00Z");
    const futureDue = new Date(now.getTime() + 10 * 86_400_000);
    const score = stabilityScore("SABQI", 10, futureDue, now);
    const baseScore = stabilityScore("SABQI", 10, null);
    expect(score).toBe(baseScore);
  });

  it("does not decay when dueDate equals now", () => {
    const now = new Date("2026-08-26T00:00:00Z");
    const score = stabilityScore("SABQI", 10, now, now);
    expect(score).toBeGreaterThanOrEqual(2);
  });

  it("extreme overdue (40+ days) clamps to minimum of 2", () => {
    const now = new Date("2026-08-26T00:00:00Z");
    const veryOverdue = new Date(now.getTime() - 60 * 86_400_000);
    const score = stabilityScore("SABQI", 10, veryOverdue, now);
    expect(score).toBeGreaterThanOrEqual(2);
  });

  it("slightly overdue (1 day) reduces score", () => {
    const now = new Date("2026-08-26T00:00:00Z");
    const oneDayLate = new Date(now.getTime() - 1 * 86_400_000);
    const fresh = stabilityScore("SABQI", 10, now, now);
    const late = stabilityScore("SABQI", 10, oneDayLate, now);
    expect(late!).toBeLessThan(fresh!);
  });

  it("score is at most 100", () => {
    const score = stabilityScore("MANZIL", 365, null);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("works for all memory states", () => {
    for (const state of ["SABAQ", "SABQI", "MANZIL"] as const) {
      const score = stabilityScore(state, 10, null);
      expect(score).toBeGreaterThan(0);
    }
  });
});

describe("stabilityColor", () => {
  it("maps tiers to distinct colors with neutral for unstarted", () => {
    expect(stabilityColor(null)).not.toBe(stabilityColor(90));
    expect(stabilityColor(0)).toBe("#e7e5e4");
    expect(stabilityColor(95)).toBe("#047857");
    expect(stabilityColor(50)).toBe("#f59e0b");
    expect(stabilityColor(10)).toBe("#ef4444");
  });

  it("returns neutral color for null", () => {
    expect(stabilityColor(null)).toBe("#e7e5e4");
  });

  it("returns neutral color for 0", () => {
    expect(stabilityColor(0)).toBe("#e7e5e4");
  });

  it("returns Weak color for score = 1", () => {
    expect(stabilityColor(1)).toBe("#ef4444");
  });

  it("returns Firm color at exactly 80", () => {
    expect(stabilityColor(80)).toBe("#047857");
  });

  it("returns Strong color at exactly 60", () => {
    expect(stabilityColor(60)).toBe("#16a34a");
  });

  it("returns Consolidating color at exactly 40", () => {
    expect(stabilityColor(40)).toBe("#f59e0b");
  });

  it("returns Fresh color at exactly 20", () => {
    expect(stabilityColor(20)).toBe("#f97316");
  });

  it("returns Weak color at 0.01", () => {
    expect(stabilityColor(0.01)).toBe("#ef4444");
  });

  it("returns Firm color at 100", () => {
    expect(stabilityColor(100)).toBe("#047857");
  });

  it("returns Strong color at 79 (just below Firm)", () => {
    expect(stabilityColor(79)).toBe("#16a34a");
  });

  it("returns Fresh color at 39 (just below Consolidating)", () => {
    expect(stabilityColor(39)).toBe("#f97316");
  });

  it("returns Weak color at 19 (just below Fresh)", () => {
    expect(stabilityColor(19)).toBe("#ef4444");
  });
});
