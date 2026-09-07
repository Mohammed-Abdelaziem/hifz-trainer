import { describe, expect, it } from "vitest";
import { cn, formatDueIn, formatMs, toArabicDigits } from "@/lib/utils";

describe("toArabicDigits", () => {
  it("converts western digits", () => {
    expect(toArabicDigits(7)).toBe("٧");
    expect(toArabicDigits(255)).toBe("٢٥٥");
  });

  it("converts 0", () => {
    expect(toArabicDigits(0)).toBe("٠");
  });

  it("converts 10", () => {
    expect(toArabicDigits(10)).toBe("١٠");
  });

  it("converts all single digits", () => {
    expect(toArabicDigits(0)).toBe("٠");
    expect(toArabicDigits(1)).toBe("١");
    expect(toArabicDigits(2)).toBe("٢");
    expect(toArabicDigits(3)).toBe("٣");
    expect(toArabicDigits(4)).toBe("٤");
    expect(toArabicDigits(5)).toBe("٥");
    expect(toArabicDigits(6)).toBe("٦");
    expect(toArabicDigits(7)).toBe("٧");
    expect(toArabicDigits(8)).toBe("٨");
    expect(toArabicDigits(9)).toBe("٩");
  });

  it("converts large numbers", () => {
    expect(toArabicDigits(123456789)).toBe("١٢٣٤٥٦٧٨٩");
  });
});

describe("formatMs", () => {
  it("formats minutes and seconds", () => {
    expect(formatMs(0)).toBe("0:00");
    expect(formatMs(65_000)).toBe("1:05");
  });

  it("formats negative values as 0:00", () => {
    expect(formatMs(-1000)).toBe("0:00");
  });

  it("formats large values", () => {
    expect(formatMs(3661_000)).toBe("61:01");
  });

  it("formats exactly 1 minute", () => {
    expect(formatMs(60_000)).toBe("1:00");
  });

  it("formats exactly 1 second", () => {
    expect(formatMs(1000)).toBe("0:01");
  });

  it("formats 59 seconds", () => {
    expect(formatMs(59_000)).toBe("0:59");
  });

  it("formats sub-second as 0:00", () => {
    expect(formatMs(500)).toBe("0:00");
  });

  it("formats 10 minutes", () => {
    expect(formatMs(600_000)).toBe("10:00");
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

  it("returns 'due now' for very small differences (< 1 min)", () => {
    expect(formatDueIn(new Date(NOW.getTime() + 30_000).toISOString(), NOW)).toBe("due now");
    expect(formatDueIn(new Date(NOW.getTime() - 30_000).toISOString(), NOW)).toBe("due now");
  });

  it("returns 'due now' at exactly 0 difference", () => {
    expect(formatDueIn(NOW.toISOString(), NOW)).toBe("due now");
  });

  it("exactly 60 minutes shows as 1h", () => {
    expect(formatDueIn(new Date(NOW.getTime() + 60 * 60_000).toISOString(), NOW)).toBe("in 1h");
  });

  it("exactly 1440 minutes (1 day) shows as 1d", () => {
    expect(formatDueIn(new Date(NOW.getTime() + 86_400_000).toISOString(), NOW)).toBe("in 1d");
  });

  it("overdue 1 hour shows as overdue 1h", () => {
    expect(formatDueIn(new Date(NOW.getTime() - 3_600_000).toISOString(), NOW)).toBe("overdue 1h");
  });

  it("overdue 5 minutes shows as overdue 5m", () => {
    expect(formatDueIn(new Date(NOW.getTime() - 5 * 60_000).toISOString(), NOW)).toBe("overdue 5m");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("does not deduplicate plain strings (only Tailwind conflicts)", () => {
    expect(cn("foo", "foo")).toBe("foo foo");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base");
    expect(cn("base", true && "active")).toBe("base active");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles Tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
