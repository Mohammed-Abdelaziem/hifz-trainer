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
});
