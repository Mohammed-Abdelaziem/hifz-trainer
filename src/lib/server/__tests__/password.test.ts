import { describe, expect, it } from "vitest";
import { isStrongPassword, PASSWORD_RULES_MESSAGE } from "@/lib/server/password";

describe("isStrongPassword", () => {
  it("requires at least 3 character categories", () => {
    expect(isStrongPassword("abcdefghij1k")).toBe(false); // lower + digit = 2
    expect(isStrongPassword("abcdefghIj1k")).toBe(true); // 3 categories
    expect(isStrongPassword("abcdefghij")).toBe(false); // 1 category
    expect(isStrongPassword("Password123!")).toBe(true); // all 4
    expect(isStrongPassword("aaaaaaaa1234")).toBe(false); // lower + digit = 2
  });

  it("enforces length bounds", () => {
    expect(isStrongPassword("Abc1!2")).toBe(false); // < 12
    expect(isStrongPassword("a".repeat(129))).toBe(false); // > 128
    expect(isStrongPassword("a".repeat(128))).toBe(false); // 128, 1 category
  });

  it("exports a human-readable rules message", () => {
    expect(PASSWORD_RULES_MESSAGE).toMatch(/12\+/);
  });
});
