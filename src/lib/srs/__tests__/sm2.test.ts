import { describe, expect, it } from "vitest";
import {
  NEW_MEMORY_STATE,
  describeOutcome,
  formatInterval,
  schedule,
  MANZIL_PROMOTION_DAYS,
} from "@/lib/srs/sm2";
import type { Sm2Input } from "@/lib/srs/sm2";

const NOW = new Date("2026-08-26T10:00:00Z");

function withPrev(prev: Partial<Sm2Input>): Sm2Input {
  return { ...NEW_MEMORY_STATE, ...prev };
}

describe("SM-2 schedule", () => {
  it("first GOOD yields 1 day and promotes SABAQ to SABQI", () => {
    const out = schedule(NEW_MEMORY_STATE, "GOOD", NOW);
    expect(out.intervalDays).toBe(1);
    expect(out.repetitionCount).toBe(1);
    expect(out.state).toBe("SABQI");
    expect(out.dueDate.toISOString()).toBe(new Date(NOW.getTime() + 86_400_000).toISOString());
  });

  it("second GOOD yields 6 days", () => {
    const out = schedule(withPrev({ repetitionCount: 1, intervalDays: 1, state: "SABQI" }), "GOOD", NOW);
    expect(out.intervalDays).toBe(6);
    expect(out.repetitionCount).toBe(2);
  });

  it("subsequent GOOD multiplies by updated ease factor", () => {
    const out = schedule(
      withPrev({ repetitionCount: 2, intervalDays: 6, easeFactor: 2.5, state: "SABQI" }),
      "GOOD",
      NOW
    );
    expect(out.intervalDays).toBe(15);
  });

  it("AGAIN resets repetitions, schedules ~10 minutes and keeps SABAQ for new verses", () => {
    const out = schedule(NEW_MEMORY_STATE, "AGAIN", NOW);
    expect(out.repetitionCount).toBe(0);
    expect(out.state).toBe("SABAQ");
    const diffMs = out.dueDate.getTime() - NOW.getTime();
    expect(diffMs).toBeGreaterThanOrEqual(500_000);
    expect(diffMs).toBeLessThanOrEqual(900_000);
  });

  it("AGAIN demotes MANZIL to SABQI", () => {
    const out = schedule(withPrev({ state: "MANZIL", intervalDays: 40 }), "AGAIN", NOW);
    expect(out.state).toBe("SABQI");
  });

  it("promotes SABQI to MANZIL once interval reaches threshold", () => {
    const out = schedule(
      withPrev({ state: "SABQI", intervalDays: 18, repetitionCount: 4 }),
      "GOOD",
      NOW
    );
    expect(out.intervalDays).toBeGreaterThanOrEqual(MANZIL_PROMOTION_DAYS);
    expect(out.state).toBe("MANZIL");
  });

  it("HARD grows slowly (1.2x) even with high ease factor", () => {
    const out = schedule(
      withPrev({ state: "SABQI", intervalDays: 10, easeFactor: 2.9, repetitionCount: 3 }),
      "HARD",
      NOW
    );
    expect(out.intervalDays).toBe(12);
  });

  it("EASY gives a 4-day head start on first success and applies easy bonus later", () => {
    const first = schedule(NEW_MEMORY_STATE, "EASY", NOW);
    expect(first.intervalDays).toBe(4);

    const second = schedule(
      withPrev({ state: "SABQI", intervalDays: first.intervalDays, easeFactor: first.easeFactor, repetitionCount: 1 }),
      "EASY",
      NOW
    );
    expect(second.intervalDays).toBeGreaterThan(first.intervalDays);
  });

  it("never drops ease factor below the floor and caps intervals", () => {
    let prev = withPrev({ easeFactor: 1.3, intervalDays: 100, repetitionCount: 5, state: "MANZIL" });
    for (let i = 0; i < 8; i++) {
      const out = schedule(prev, "AGAIN", NOW);
      expect(out.easeFactor).toBeGreaterThanOrEqual(1.3);
      prev = { ...prev, ...out };
    }
    const huge = schedule(withPrev({ intervalDays: 500, easeFactor: 2.9, repetitionCount: 9, state: "MANZIL" }), "EASY", NOW);
    expect(huge.intervalDays).toBeLessThanOrEqual(365);
  });
});

describe("formatInterval / describeOutcome", () => {
  it("formats sub-hour, hours, days and months", () => {
    expect(formatInterval(10 / 1440)).toBe("10 min");
    expect(formatInterval(0.05)).toBe("1 hr");
    expect(formatInterval(3)).toBe("3 days");
    expect(formatInterval(45)).toBe("2 mo");
  });

  it("describes lapse vs promotion outcomes", () => {
    expect(describeOutcome({ state: "SABQI", intervalDays: 10 / 1440 }, "AGAIN")).toContain("back to Sabqi");
    expect(describeOutcome({ state: "MANZIL", intervalDays: 30 }, "GOOD")).toContain("Manzil");
    expect(describeOutcome({ state: "SABQI", intervalDays: 6 }, "GOOD")).toMatch(/next in 6 days/);
  });
});
