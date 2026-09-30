import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DailyQueue } from "@/types/srs";
import { TaskQueueTabs } from "@/components/dashboard/TaskQueueTabs";

const queue: DailyQueue = {
  sabaq: [],
  sabqi: [
    {
      verseKey: "112:2",
      surahId: 112,
      surahName: "Al-Ikhlas",
      ayahNumber: 2,
      pageNumber: 604,
      dueAt: new Date(Date.now() - 3_600_000).toISOString(),
      intervalDays: 1,
    },
  ],
  manzil: [],
  estimatedMinutes: 2,
  scheduler: "sm2",
  requestRetention: 0.9,
  streak: { current: 1, longest: 1, dailyTargetCount: 10, todayReviewed: 0, todayRead: 0 },
};

describe("TaskQueueTabs", () => {
  it("defaults to Sabaq and points an empty plan at the intake control", () => {
    render(<TaskQueueTabs queue={queue} />);
    // The old copy congratulated a brand-new user with zero history on
    // "staying on top", so the empty state now names the control that fixes it.
    expect(screen.getByText(/No new verses yet/)).toBeInTheDocument();
    expect(screen.getByText(/Add to Sabaq/)).toBeInTheDocument();
  });

  it("tells a guest to sign in instead of offering an empty plan", () => {
    render(<TaskQueueTabs queue={queue} isGuest />);
    expect(screen.getByText(/Sign in to add verses/)).toBeInTheDocument();
  });

  it("switches to Sabqi and lists its items with deep links", async () => {
    const user = userEvent.setup();
    render(<TaskQueueTabs queue={queue} />);

    await user.click(screen.getByRole("tab", { name: /Sabqi/ }));
    const link = await screen.findByRole("link", { name: /112:2/ });
    expect(link).toHaveAttribute("href", "/reader/112?verse=112:2");
    expect(screen.getByText(/overdue 1h/)).toBeInTheDocument();
  });

  it("shows an empty state for Manzil bucket", async () => {
    const user = userEvent.setup();
    render(<TaskQueueTabs queue={queue} />);

    await user.click(screen.getByRole("tab", { name: /Manzil/ }));
    expect(await screen.findByText(/No long-term verses due/)).toBeInTheDocument();
  });
});
