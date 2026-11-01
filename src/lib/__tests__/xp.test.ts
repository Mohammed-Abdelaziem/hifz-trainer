import { describe, expect, it } from "vitest";
import { levelForXp, xpForLevel, xpFromGradeCounts } from "../xp";

describe("xp — xpForLevel thresholds", () => {
  it("entry thresholds are 25·(n−1)²", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(25);
    expect(xpForLevel(3)).toBe(100);
    expect(xpForLevel(4)).toBe(225);
  });
});

describe("xp — levelForXp", () => {
  it("level 1 holds XP below the first threshold", () => {
    expect(levelForXp(0)).toMatchObject({ level: 1, intoLevel: 0, toNextLevel: 25 });
    expect(levelForXp(24)).toMatchObject({ level: 1, intoLevel: 24, toNextLevel: 1 });
  });

  it("crosses thresholds at exact boundaries", () => {
    expect(levelForXp(25).level).toBe(2);
    expect(levelForXp(100).level).toBe(3);
    expect(levelForXp(25).toNextLevel).toBe(75);
    expect(levelForXp(100).intoLevel).toBe(0);
  });

  it("clamps negatives", () => {
    expect(levelForXp(-5).level).toBe(1);
    expect(levelForXp(-5).totalXp).toBe(0);
  });
});

describe("xp — xpFromGradeCounts", () => {
  it("weights grades AGAIN 1 / HARD 2 / GOOD 4 / EASY 6", () => {
    expect(xpFromGradeCounts({ AGAIN: 2, HARD: 1, GOOD: 3, EASY: 1 })).toBe(2 + 2 + 12 + 6);
  });

  it("ignores unknown grades", () => {
    expect(xpFromGradeCounts({ WEIRD: 5 })).toBe(0);
  });
});
