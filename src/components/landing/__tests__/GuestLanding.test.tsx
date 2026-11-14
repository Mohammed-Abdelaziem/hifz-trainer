import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuestLanding } from "../GuestLanding";

describe("GuestLanding", () => {
  it("renders value proposition, primary CTAs, and interactive recall demo", async () => {
    const user = userEvent.setup();
    render(<GuestLanding />);

    expect(
      screen.getByRole("heading", { name: /Memorize the Quran without losing what you already know/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Start free — save your progress/i })
    ).toHaveAttribute("href", "/login");

    expect(
      screen.getByRole("link", { name: /Try live reader/i })
    ).toHaveAttribute("href", "/reader/1");

    // Interactive grade preview gives immediate feedback + signup link
    await user.click(screen.getByRole("button", { name: /Good/i }));
    expect(screen.getByText(/Scheduled \(Good · next review in 6d\)/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Save to your queue/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
