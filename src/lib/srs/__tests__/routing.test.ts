import { describe, expect, it } from "vitest";
import { applyHifzRouting } from "@/lib/srs/routing";

describe("applyHifzRouting", () => {
  it("keeps SABAQ on failure and graduates on any success", () => {
    expect(applyHifzRouting("SABAQ", "AGAIN", 0.007)).toBe("SABAQ");
    expect(applyHifzRouting("SABAQ", "AGAIN", 0)).toBe("SABAQ");
    for (const grade of ["HARD", "GOOD", "EASY"] as const) {
      expect(applyHifzRouting("SABAQ", grade, 1)).toBe("SABQI");
    }
  });

  it("demotes MANZIL only on AGAIN", () => {
    expect(applyHifzRouting("MANZIL", "AGAIN", 1)).toBe("SABQI");
    expect(applyHifzRouting("MANZIL", "HARD", 5)).toBe("MANZIL");
    expect(applyHifzRouting("MANZIL", "GOOD", 25)).toBe("MANZIL");
  });

  it("promotes SABQI at the 21-day threshold only", () => {
    expect(applyHifzRouting("SABQI", "GOOD", 20.99)).toBe("SABQI");
    expect(applyHifzRouting("SABQI", "GOOD", 21)).toBe("MANZIL");
    expect(applyHifzRouting("SABQI", "EASY", 30)).toBe("MANZIL");
  });

  it("SABQI + AGAIN stays SABQI (not demoted further)", () => {
    expect(applyHifzRouting("SABQI", "AGAIN", 10)).toBe("SABQI");
  });

  it("SABQI + HARD with interval < 21 stays SABQI", () => {
    expect(applyHifzRouting("SABQI", "HARD", 10)).toBe("SABQI");
  });

  it("SABQI + HARD with interval >= 21 promotes to MANZIL", () => {
    expect(applyHifzRouting("SABQI", "HARD", 21)).toBe("MANZIL");
  });

  it("MANZIL + HARD stays MANZIL", () => {
    expect(applyHifzRouting("MANZIL", "HARD", 25)).toBe("MANZIL");
  });

  it("MANZIL + EASY stays MANZIL", () => {
    expect(applyHifzRouting("MANZIL", "EASY", 30)).toBe("MANZIL");
  });

  it("SABAQ + HARD with interval 0 stays SABAQ (but grade is HARD, not AGAIN)", () => {
    expect(applyHifzRouting("SABAQ", "HARD", 0)).toBe("SABQI");
  });

  it("SABQI + GOOD with interval 0 stays SABQI", () => {
    expect(applyHifzRouting("SABQI", "GOOD", 0)).toBe("SABQI");
  });

  it("MANZIL + AGAIN with interval 0 demotes to SABQI", () => {
    expect(applyHifzRouting("MANZIL", "AGAIN", 0)).toBe("SABQI");
  });

  it("SABQI + EASY at exactly 21 promotes to MANZIL", () => {
    expect(applyHifzRouting("SABQI", "EASY", 21)).toBe("MANZIL");
  });

  it("SABQI + GOOD at 20 stays SABQI", () => {
    expect(applyHifzRouting("SABQI", "GOOD", 20)).toBe("SABQI");
  });

  it("SABQI + AGAIN stays SABQI even with large interval", () => {
    expect(applyHifzRouting("SABQI", "AGAIN", 100)).toBe("SABQI");
  });
});
