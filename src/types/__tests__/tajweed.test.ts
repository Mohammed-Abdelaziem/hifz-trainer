import { describe, expect, it } from "vitest";
import type { TajweedResult, TajweedIssue } from "@/types/tajweed";

describe("TajweedResult type", () => {
  it("accepts valid result object", () => {
    const result: TajweedResult = {
      transcription: "بِسْمِ اللَّهِ",
      score: 85,
      issues: [
        {
          rule: "Madd",
          severity: "warning",
          message: "Too fast",
          suggestion: "Slow down",
        },
      ],
      similarity: 75.5,
      reference: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
    };
    expect(result.score).toBe(85);
  });

  it("accepts error result", () => {
    const result: TajweedResult = {
      error: "API key not set",
    };
    expect(result.error).toBe("API key not set");
  });

  it("accepts result with null optional fields", () => {
    const result: TajweedResult = {
      transcription: "test",
      score: 50,
      similarity: null,
      reference: null,
    };
    expect(result.similarity).toBeNull();
  });

  it("accepts issue with all severity levels", () => {
    const errors: TajweedIssue[] = [
      { rule: "A", severity: "error", message: "err", suggestion: "fix" },
      { rule: "B", severity: "warning", message: "warn", suggestion: "fix" },
      { rule: "C", severity: "info", message: "info", suggestion: "fix" },
    ];
    expect(errors).toHaveLength(3);
  });

  it("accepts empty issues array", () => {
    const result: TajweedResult = {
      transcription: "test",
      score: 100,
      issues: [],
    };
    expect(result.issues).toHaveLength(0);
  });
});
