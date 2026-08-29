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
  streak: { current: 1, longest: 1, dailyTargetCount: 10, todayReviewed: 0 },
};

describe("TaskQueueTabs", () => {
  it("defaults to Sabqi and lists its items with deep links", () => {
    render(<TaskQueueTabs queue={queue} />);
    const link = screen.getByRole("link", { name: /112:2/ });
    expect(link).toHaveAttribute("href", "/reader/112?verse=112:2");
    expect(screen.getByText(/overdue 1h/)).toBeInTheDocument();
  });

  it("shows an empty state for buckets without tasks", async () => {
    const user = userEvent.setup();
    render(<TaskQueueTabs queue={queue} />);

    await user.click(screen.getByRole("tab", { name: /Manzil/ }));
    expect(await screen.findByText(/Nothing due in Manzil/)).toBeInTheDocument();
  });

  it("switches to Sabaq bucket on click", async () => {
    const user = userEvent.setup();
    render(<TaskQueueTabs queue={queue} />);

    await user.click(screen.getByRole("tab", { name: /Sabaq/ }));
    expect(await screen.findByText(/Nothing due in Sabaq/)).toBeInTheDocument();
  });
});
