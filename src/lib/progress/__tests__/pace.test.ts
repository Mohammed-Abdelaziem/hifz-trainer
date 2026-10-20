import { describe, expect, it } from "vitest";
import { computePace } from "../pace";
import { DAY_MS } from "@/lib/constants";

const NOW = 1_800_000_000_000; // fixed anchor

describe("computePace", () => {
  it("computes the daily rate with ceiling rounding", () => {
    // Ten verses to go, five days: exactly two a day.
    const exact = computePace({
      memorized: 100,
      total: 110,
      targetDateMs: NOW + 5 * DAY_MS,
      nowMs: NOW,
    });
    expect(exact.perDay).toBe(2);
    expect(exact.daysLeft).toBe(5);

    // Eleven verses over five days: 2.2 must not round down to 2.
    const spillover = computePace({
      memorized: 100,
      total: 111,
      targetDateMs: NOW + 5 * DAY_MS,
      nowMs: NOW,
    });
    expect(spillover.perDay).toBe(3);
  });

  it("reports per-week totals alongside the daily rate", () => {
    const s = computePace({
      memorized: 100,
      total: 1010,
      targetDateMs: NOW + 10 * DAY_MS,
      nowMs: NOW,
    });
    expect(s.remaining).toBe(910);
    expect(s.perDay).toBe(91);
    expect(s.perWeek).toBe(637);
  });

  it("counts a partial day as a full study day when flooring daysLeft", () => {
    const s = computePace({
      memorized: 0,
      total: 10,
      targetDateMs: NOW + 2.5 * DAY_MS,
      nowMs: NOW,
    });
    expect(s.daysLeft).toBe(2);
  });

  it("marks a target in the past as overdue with no rate", () => {
    const s = computePace({
      memorized: 5,
      total: 10,
      targetDateMs: NOW - DAY_MS,
      nowMs: NOW,
    });
    expect(s.overdue).toBe(true);
    expect(s.perDay).toBeNull();
    expect(s.daysLeft).toBeLessThanOrEqual(0);
  });

  it("returns no rate when no target date is set", () => {
    for (const target of [undefined, null, Number.NaN]) {
      const s = computePace({
        memorized: 5,
        total: 10,
        targetDateMs: target,
        nowMs: NOW,
      });
      expect(s.perDay).toBeNull();
      expect(s.daysLeft).toBeNull();
      expect(s.remaining).toBe(5);
    }
  });

  it("everything marked is a finished khatm regardless of the date", () => {
    const s = computePace({
      memorized: 20,
      total: 20,
      targetDateMs: NOW + DAY_MS,
      nowMs: NOW,
    });
    expect(s.remaining).toBe(0);
    expect(s.perDay).toBeNull();
    expect(s.overdue).toBe(false);
  });

  it("ignores junk numbers", () => {
    const s = computePace({ memorized: -5, total: Number.NaN, nowMs: NOW });
    expect(s.total).toBe(0);
    expect(s.memorized).toBe(0);
    expect(s.remaining).toBe(0);
    expect(s.perDay).toBeNull();
  });

  it("floors non-integer inputs", () => {
    const s = computePace({
      memorized: 10.9,
      total: 20.9,
      targetDateMs: NOW + DAY_MS,
      nowMs: NOW,
    });
    expect(s.memorized).toBe(10);
    expect(s.remaining).toBe(10);
    expect(s.perDay).toBe(10);
  });
});
