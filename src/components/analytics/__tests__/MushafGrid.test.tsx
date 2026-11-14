import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MemoryCell } from "@/types/srs";

const mockUseMemoryMap = vi.fn();

vi.mock("@/hooks/use-srs-data", () => ({
  useMemoryMap: () => mockUseMemoryMap(),
}));

import { MushafGrid } from "../MushafGrid";

function makeCell(overrides: Partial<MemoryCell>): MemoryCell {
  return {
    verseKey: "1:1",
    surahId: 1,
    surahName: "Al-Fatihah",
    pageNumber: 1,
    ayahNumber: 1,
    state: null,
    intervalDays: 0,
    dueAt: null,
    stability: null,
    readCount: 0,
    ...overrides,
  };
}

describe("MushafGrid", () => {
  beforeEach(() => {
    mockUseMemoryMap.mockReset();
  });

  it("reflects partially known surahs on the heatmap and counts known verses", () => {
    const verses: MemoryCell[] = [
      makeCell({ verseKey: "1:1", ayahNumber: 1, state: "KNOWN", stability: 100 }),
      makeCell({ verseKey: "1:2", ayahNumber: 2, state: "KNOWN", stability: 100 }),
      makeCell({ verseKey: "1:3", ayahNumber: 3, state: null, stability: null }),
      makeCell({ verseKey: "112:1", surahId: 112, surahName: "Al-Ikhlas", pageNumber: 604, ayahNumber: 1, state: "KNOWN", stability: 100 }),
    ];

    mockUseMemoryMap.mockReturnValue({
      data: { verses },
      isLoading: false,
      isError: false,
    });

    render(<MushafGrid />);

    // Known stat counts all 3 KNOWN verses (2 partial in Surah 1 + 1 full in Surah 112)
    expect(screen.getByText("Known").previousElementSibling).toHaveTextContent("3");
    expect(screen.getByText("Partially known")).toBeInTheDocument();

    // Surah 1 cell should have the partial-known teal color (#2dd4bf = rgb(45, 212, 191)), not gray (#d6d3d1)
    const surah1Link = screen.getByRole("link", { name: "1" });
    const surah1Cell = surah1Link.firstElementChild as HTMLElement;
    expect(surah1Cell.style.backgroundColor).toBe("rgb(45, 212, 191)");

    // Surah 112 is 1/1 known -> full KNOWN color (#0d9488 = rgb(13, 148, 136))
    const surah112Link = screen.getByRole("link", { name: "112" });
    const surah112Cell = surah112Link.firstElementChild as HTMLElement;
    expect(surah112Cell.style.backgroundColor).toBe("rgb(13, 148, 136)");
  });
});
