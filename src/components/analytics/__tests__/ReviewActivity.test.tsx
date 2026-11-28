import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReviewStats } from "@/types/srs";

const mockUseReviewStats = vi.fn();

vi.mock("@/hooks/use-srs-data", () => ({
  useReviewStats: () => mockUseReviewStats(),
}));

import { ReviewActivity } from "../ReviewActivity";

function makeStats(overrides: Partial<ReviewStats> = {}): ReviewStats {
  return {
    totalReviews: 0,
    totalReads: 0,
    activeDays: 0,
    readDays: 0,
    avgDurationMs: 0,
    grades: { AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 },
    perDay: [
      { date: "2026-11-27", count: 0, reads: 0 },
      { date: "2026-11-28", count: 0, reads: 0 },
    ],
    schedulerCompare: {
      buckets: ["≤1d", "1–3d", "3–7d", "7–21d", ">21d"],
      sm2: [0, 0, 0, 0, 0],
      fsrs: [0, 0, 0, 0, 0],
      totals: { sm2: 0, fsrs: 0 },
    },
    xp: { totalXp: 0, level: 1, intoLevel: 0, toNextLevel: 25 },
    recap: {
      reviewsThisWeek: 0,
      reviewsLastWeek: 0,
      activeDaysThisWeek: 0,
      bestDay: null,
      topSurah: null,
      xpThisWeek: 0,
    },
    achievements: [],
    ...overrides,
  };
}

describe("ReviewActivity", () => {
  beforeEach(() => {
    mockUseReviewStats.mockReset();
  });

  it("shows reading activity and combined active days even with zero graded reviews", () => {
    mockUseReviewStats.mockReturnValue({
      data: makeStats({
        totalReviews: 0,
        totalReads: 5,
        activeDays: 0,
        readDays: 1,
        perDay: [
          { date: "2026-11-27", count: 0, reads: 0 },
          { date: "2026-11-28", count: 0, reads: 5 },
        ],
      }),
      isLoading: false,
      isError: false,
    });

    render(<ReviewActivity />);

    expect(screen.getByText(/0 reviews · 5 reads · 1 active day$/)).toBeInTheDocument();
    expect(screen.getByTitle("2026-11-28: 5 reads")).toBeInTheDocument();
    expect(screen.queryByText(/Marking verses as Already Known/)).not.toBeInTheDocument();
  });

  it("shows both graded reviews and reads with combined active days", () => {
    mockUseReviewStats.mockReturnValue({
      data: makeStats({
        totalReviews: 3,
        totalReads: 4,
        activeDays: 1,
        readDays: 2,
        avgDurationMs: 4200,
        grades: { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 0 },
        perDay: [
          { date: "2026-11-27", count: 0, reads: 2 },
          { date: "2026-11-28", count: 3, reads: 2 },
        ],
      }),
      isLoading: false,
      isError: false,
    });

    render(<ReviewActivity />);

    expect(
      screen.getByText(/3 reviews · 4 reads · 2 active days · ~4s per review/)
    ).toBeInTheDocument();
    expect(screen.getByTitle("2026-11-28: 3 reviews, 2 reads")).toBeInTheDocument();
  });

  it("explains how activity is logged when both reviews and reads are empty", () => {
    mockUseReviewStats.mockReturnValue({
      data: makeStats(),
      isLoading: false,
      isError: false,
    });

    render(<ReviewActivity />);

    expect(screen.getByText(/Marking verses as Already Known skips SRS reviews/)).toBeInTheDocument();
  });
});
