import { describe, expect, it } from "vitest";
import { stabilityColor, stabilityScore } from "@/lib/srs/stability";

describe("stabilityScore", () => {
  it("returns null for untracked verses", () => {
    expect(stabilityScore(null, 0, null)).toBeNull();
  });

  it("scores brand-new verses near the floor", () => {
    expect(stabilityScore("SABAQ", 0, null)).toBe(4);
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
});

describe("stabilityColor", () => {
  it("maps tiers to distinct colors with neutral for unstarted", () => {
    expect(stabilityColor(null)).not.toBe(stabilityColor(90));
    expect(stabilityColor(0)).toBe("#e7e5e4");
    expect(stabilityColor(95)).toBe("#047857");
    expect(stabilityColor(50)).toBe("#f59e0b");
    expect(stabilityColor(10)).toBe("#ef4444");
  });
});
