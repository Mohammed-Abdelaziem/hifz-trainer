import { describe, expect, it } from "vitest";
import { formatDueIn, formatMs, toArabicDigits } from "@/lib/utils";

describe("toArabicDigits", () => {
  it("converts western digits", () => {
    expect(toArabicDigits(7)).toBe("٧");
    expect(toArabicDigits(255)).toBe("٢٥٥");
  });
});

describe("formatMs", () => {
  it("formats minutes and seconds", () => {
    expect(formatMs(0)).toBe("0:00");
    expect(formatMs(65_000)).toBe("1:05");
  });
});

describe("formatDueIn", () => {
  const NOW = new Date("2026-08-26T12:00:00Z");

  it("reports overdue items", () => {
    const iso = new Date(NOW.getTime() - 2 * 86_400_000).toISOString();
    expect(formatDueIn(iso, NOW)).toBe("overdue 2d");
  });

  it("reports future items in m/h/d", () => {
    expect(
      formatDueIn(new Date(NOW.getTime() + 30 * 60_000).toISOString(), NOW)
    ).toBe("in 30m");
    expect(
      formatDueIn(new Date(NOW.getTime() + 5 * 3_600_000).toISOString(), NOW)
    ).toBe("in 5h");
    expect(
      formatDueIn(new Date(NOW.getTime() + 3 * 86_400_000).toISOString(), NOW)
    ).toBe("in 3d");
  });
});
