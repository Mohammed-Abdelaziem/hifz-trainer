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
});
