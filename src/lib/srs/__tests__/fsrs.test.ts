import { describe, expect, it } from "vitest";
import { EMPTY_FSRS_INPUT, scheduleFsrs } from "@/lib/srs/fsrs";

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

  it("clamps requested retention into the supported range", () => {
    const low = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, 0.1);
    const high = scheduleFsrs(EMPTY_FSRS_INPUT, "GOOD", NOW, 0.99);
    expect(low.intervalDays).toBeGreaterThan(0);
    expect(high.intervalDays).toBeGreaterThan(0);
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
});
