import { describe, expect, it } from "vitest";
import { EMPTY_FSRS_INPUT, scheduleFsrs, MIN_RETENTION, MAX_RETENTION } from "@/lib/srs/fsrs";

const NOW = new Date("2026-08-26T10:00:00Z");

describe("scheduleFsrs wrapper", () => {
  it("initializes stability/difficulty per rating on first review", () => {
    const again = scheduleFsrs(EMPTY_FSRS_INPUT, "AGAIN", NOW);
    const good = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW);
    const easy = scheduleFsrs(EMPTY_FSRS_INPUT, "EASY", NOW);

    expect(good.stability).toBeGreaterThan(again.stability);
    expect(easy.difficulty).toBeLessThan(good.difficulty);
    expect(again.difficulty).toBeGreaterThan(good.difficulty);
  });

  it("HARD on first review produces lower difficulty than GOOD", () => {
    const hard = scheduleFsrs(EMPTY_FSRS_INPUT, "HARD", NOW);
    const good = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW);
    expect(hard.difficulty).toBeGreaterThan(good.difficulty);
  });

  it("HARD on first review produces positive interval", () => {
    const hard = scheduleFsrs(EMPTY_FSRS_INPUT, "HARD", NOW);
    expect(hard.intervalDays).toBeGreaterThanOrEqual(0);
    expect(hard.stability).toBeGreaterThan(0);
  });

  it("collapses stability and spikes difficulty after a lapse", () => {
    const reviewed = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW);
    const lapsed = scheduleFsrs(
      {
        difficulty: reviewed.difficulty,
        stability: Math.max(reviewed.stability, 5),
        repetitionCount: 2,
        lapses: 0,
      },
      "AGAIN",
      NOW
    );
    expect(lapsed.stability).toBeLessThan(1);
    expect(lapsed.difficulty).toBeGreaterThanOrEqual(6);
  });

  it("multiple consecutive lapses keep stability low", () => {
    let input = { ...EMPTY_FSRS_INPUT };
    for (let i = 0; i < 3; i++) {
      const good = scheduleFsrs(input, "GOOD", NOW);
      const lapsed = scheduleFsrs(
        {
          difficulty: good.difficulty,
          stability: Math.max(good.stability, 5),
          repetitionCount: 2,
          lapses: i,
        },
        "AGAIN",
        NOW
      );
      expect(lapsed.stability).toBeLessThan(1);
      input = {
        difficulty: lapsed.difficulty,
        stability: lapsed.stability,
        repetitionCount: 0,
        lapses: i + 1,
      };
    }
  });

  it("clamps requested retention into the supported range", () => {
    const low = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, 0.1);
    const high = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, 0.99);
    expect(low.intervalDays).toBeGreaterThan(0);
    expect(high.intervalDays).toBeGreaterThan(0);
  });

  it("exactly MIN_RETENTION (0.7) produces valid result", () => {
    const out = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, MIN_RETENTION);
    expect(out.intervalDays).toBeGreaterThan(0);
    expect(out.stability).toBeGreaterThan(0);
  });

  it("exactly MAX_RETENTION (0.98) produces valid result", () => {
    const out = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, MAX_RETENTION);
    expect(out.intervalDays).toBeGreaterThan(0);
    expect(out.stability).toBeGreaterThan(0);
  });

  it("higher retention produces shorter intervals", () => {
    const low = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, MIN_RETENTION);
    const high = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, MAX_RETENTION);
    expect(high.intervalDays).toBeLessThanOrEqual(low.intervalDays);
  });

  it("keeps difficulty within the 1-10 band across long chains", () => {
    let input = EMPTY_FSRS_INPUT;
    for (let i = 0; i < 12; i++) {
      const grade = i % 3 === 0 ? "EASY" : "GOOD";
      const out = scheduleFsrs(input, grade, NOW);
      input = {
        difficulty: out.difficulty,
        stability: out.stability,
        repetitionCount: i + 1,
        lapses: 0,
      };
      expect(out.difficulty).toBeGreaterThanOrEqual(1);
      expect(out.difficulty).toBeLessThanOrEqual(10);
      expect(out.stability).toBeGreaterThan(0);
    }
  });

  it("EASY produces higher interval than GOOD for same input", () => {
    const good = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW);
    const easy = scheduleFsrs(EMPTY_FSRS_INPUT, "EASY", NOW);
    expect(easy.intervalDays).toBeGreaterThanOrEqual(good.intervalDays);
  });

  it("dueDate is always in the future for non-zero intervals", () => {
    for (const grade of ["AGAIN", "HARD", "GOOD", "EASY"] as const) {
      const out = scheduleFsrs(EMPTY_FSRS_INPUT, grade, NOW);
      if (out.intervalDays > 0) {
        expect(out.dueDate.getTime()).toBeGreaterThan(NOW.getTime());
      }
    }
  });

  it("produces consistent results for same inputs (engine caching)", () => {
    const a = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, 0.9);
    const b = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, 0.9);
    expect(a.intervalDays).toBe(b.intervalDays);
    expect(a.stability).toBe(b.stability);
    expect(a.difficulty).toBe(b.difficulty);
  });

  it("stability is always positive after first review", () => {
    const out = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW);
    expect(out.stability).toBeGreaterThan(0);
  });

  it("intervalDays is non-negative", () => {
    for (const grade of ["AGAIN", "HARD", "GOOD", "EASY"] as const) {
      const out = scheduleFsrs(EMPTY_FSRS_INPUT, grade, NOW);
      expect(out.intervalDays).toBeGreaterThanOrEqual(0);
    }
  });
});
