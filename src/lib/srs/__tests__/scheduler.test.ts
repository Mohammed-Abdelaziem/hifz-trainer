import { describe, expect, it } from "vitest";
import { getScheduler, scheduleReview } from "../index";

describe("SRS scheduler strategy", () => {
  it("dispatches SM-2 and FSRS through the same interface", () => {
    const now = new Date("2026-06-01T12:00:00Z");

    const sm2Out = scheduleReview("sm2", null, "GOOD", { now });
    expect(sm2Out.state).toBe("SABQI");
    expect(sm2Out.intervalDays).toBe(1);
    expect(sm2Out.difficulty).toBeNull();
    expect(sm2Out.stability).toBeNull();

    const fsrsOut = scheduleReview("fsrs", null, "GOOD", { now, requestRetention: 0.9 });
    expect(fsrsOut.state).toBe("SABQI");
    expect(fsrsOut.repetitionCount).toBe(1);
    expect(fsrsOut.difficulty).not.toBeNull();
    expect(fsrsOut.stability).not.toBeNull();
  });

  it("increments lapses on AGAIN for non-SABAQ states in both schedulers", () => {
    const now = new Date("2026-06-01T12:00:00Z");
    const prev = {
      state: "MANZIL" as const,
      intervalDays: 30,
      easeFactor: 2.5,
      repetitionCount: 5,
      lapses: 1,
      difficulty: 5,
      stability: 30,
    };

    const sm2Lapse = getScheduler("sm2").schedule(prev, "AGAIN", { now });
    expect(sm2Lapse.state).toBe("SABQI");
    expect(sm2Lapse.lapses).toBe(2);

    const fsrsLapse = getScheduler("fsrs").schedule(prev, "AGAIN", { now });
    expect(fsrsLapse.state).toBe("SABQI");
    expect(fsrsLapse.lapses).toBe(2);
  });
});
