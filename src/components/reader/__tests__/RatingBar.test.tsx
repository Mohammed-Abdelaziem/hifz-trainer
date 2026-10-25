import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingBar } from "@/components/reader/RatingBar";

describe("RatingBar", () => {
  it("renders all four grades with the verse key", () => {
    render(<RatingBar verseKey="112:1" onGrade={() => {}} />);
    expect(screen.getByText("Again")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText(/112:1/)).toBeInTheDocument();
  });

  it("invokes onGrade with the matching grade", async () => {
    const onGrade = vi.fn();
    const user = userEvent.setup();
    render(<RatingBar verseKey="1:1" onGrade={onGrade} />);

    await user.click(screen.getByText("Good"));
    await user.click(screen.getByText("Again"));
    expect(onGrade).toHaveBeenNthCalledWith(1, "GOOD");
    expect(onGrade).toHaveBeenNthCalledWith(2, "AGAIN");
  });

  it("hides the Know button for guests (no onKnown)", () => {
    render(<RatingBar verseKey="112:1" onGrade={() => {}} />);
    expect(
      screen.queryByRole("button", { name: /already know 112:1/i })
    ).not.toBeInTheDocument();
  });

  it("shows the Know button when signed in and fires onKnown", async () => {
    const onKnown = vi.fn();
    const user = userEvent.setup();
    render(<RatingBar verseKey="112:1" onGrade={() => {}} onKnown={onKnown} />);

    const button = screen.getByRole("button", {
      name: /already know 112:1 — skip the hifz process/i,
    });
    await user.click(button);
    expect(onKnown).toHaveBeenCalledTimes(1);
  });

  it("shows the Know Surah button when onKnownSurah is provided and fires callback", async () => {
    const onKnownSurah = vi.fn();
    const user = userEvent.setup();
    render(<RatingBar verseKey="112:1" onGrade={() => {}} onKnownSurah={onKnownSurah} />);

    const button = screen.getByRole("button", {
      name: /mark entire surah as already known/i,
    });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(onKnownSurah).toHaveBeenCalledTimes(1);
  });
});
