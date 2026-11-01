import { describe, expect, it } from "vitest";
import { deriveStreak } from "../streak-grace";

/** Builds yyyy-mm-dd keys from offsets back from today (UTC). */
function keysAgo(offsets: number[], today: string): string[] {
  const anchor = new Date(`${today}T00:00:00Z`);
  return offsets
    .map((off) => {
      const d = new Date(anchor);
      d.setUTCDate(d.getUTCDate() - off);
      return d.toISOString().slice(0, 10);
    })
    .sort();
}

const TODAY = "2026-11-01";

describe("deriveStreak", () => {
  it("active today starts at 1", () => {
    expect(deriveStreak([TODAY], TODAY, TODAY)).toMatchObject({
      current: 1,
      graceUsed: false,
      truncated: true,
    });
  });

  it("counts consecutive days back", () => {
    const days = keysAgo([0, 1, 2, 3], TODAY);
    expect(deriveStreak(days, TODAY).current).toBe(4);
  });

  it("an open (inactive) today does not break the run", () => {
    const days = keysAgo([1, 2, 3], TODAY);
    expect(deriveStreak(days, TODAY).current).toBe(3);
    expect(deriveStreak(days, TODAY).graceUsed).toBe(false);
  });

  it("bridges exactly one missed day (the freeze)", () => {
    // gap at day 2 back: active today, yesterday, then MISS, then two active.
    const days = keysAgo([0, 1, 3, 4], TODAY);
    const out = deriveStreak(days, TODAY);
    expect(out.current).toBe(4);
    expect(out.graceUsed).toBe(true);
  });

  it("a second miss terminates the run", () => {
    const days = keysAgo([0, 1, 3, 5], TODAY);
    const out = deriveStreak(days, TODAY);
    // today, 1, bridge miss 2, 3, then second miss 4 terminates.
    expect(out.current).toBe(3);
    expect(out.graceUsed).toBe(true);
  });

  it("miss before any activity does not start a run (two quiet days = dead)", () => {
    const days = keysAgo([2, 3], TODAY); // today+yesterday quiet, then active
    const out = deriveStreak(days, TODAY);
    expect(out.current).toBe(0);
    expect(out.graceUsed).toBe(false);
  });

  it("a 1-day run at the thin-window edge stays ambiguous, grace unspent", () => {
    // Active yesterday only; today's open day bridges without consuming the grace.
    const out = deriveStreak(keysAgo([1], TODAY), TODAY);
    expect(out.current).toBe(1);
    expect(out.graceUsed).toBe(false);
    expect(out.truncated).toBe(true);
  });

  it("never truncates without a window bound", () => {
    // Default bound = oldest observed activity day.
    const out = deriveStreak(keysAgo([0, 1, 2, 3], TODAY), TODAY);
    expect(out.current).toBe(4);
    expect(out.truncated).toBe(true);
  });

  it("a fully active fetched window truncates cleanly (service fallback)", () => {
    const days = keysAgo([0, 1, 2], TODAY);
    expect(deriveStreak(days, TODAY)).toEqual({
      current: 3,
      graceUsed: false,
      truncated: true,
    });
  });

  it("flags truncation at the window edge", () => {
    // Window only contains [yesterday]; run alive at its bottom edge.
    const days = keysAgo([1], TODAY);
    const out = deriveStreak(days, TODAY);
    expect(out.current).toBe(1);
    expect(out.truncated).toBe(true);
  });

  it("no activity at all → current 0", () => {
    expect(deriveStreak([], TODAY)).toMatchObject({ current: 0, graceUsed: false, truncated: false });
  });

  it("is deterministic for idempotent inputs", () => {
    const days = keysAgo([0, 1, 3], TODAY);
    const a = deriveStreak(days, TODAY);
    const b = deriveStreak([...days, days[0]], TODAY); // duplicate-inclusive
    expect(a).toEqual(b);
  });
});
