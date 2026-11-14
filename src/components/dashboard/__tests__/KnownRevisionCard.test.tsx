import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { KnownRevisionSummary } from "@/types/srs";
import { KnownRevisionCard } from "../KnownRevisionCard";

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("KnownRevisionCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when totalKnown is 0", () => {
    const { container } = renderWithQuery(
      <KnownRevisionCard
        knownRevision={{
          totalKnown: 0,
          dueCount: 0,
          revisedRecently: 0,
          nextDueAt: null,
          dueItems: [],
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows periodic revision advice and lets the user mark a surah revised", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, revised: 2, nextDueAt: "2026-12-05T00:00:00.000Z" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const summary: KnownRevisionSummary = {
      totalKnown: 10,
      dueCount: 2,
      revisedRecently: 8,
      nextDueAt: null,
      dueItems: [
        {
          verseKey: "67:1",
          surahId: 67,
          surahName: "Al-Mulk",
          ayahNumber: 1,
          pageNumber: 562,
          dueAt: new Date(Date.now() - 86_400_000).toISOString(),
          intervalDays: 14,
        },
        {
          verseKey: "67:2",
          surahId: 67,
          surahName: "Al-Mulk",
          ayahNumber: 2,
          pageNumber: 562,
          dueAt: new Date(Date.now() - 86_400_000).toISOString(),
          intervalDays: 14,
        },
      ],
    };

    renderWithQuery(<KnownRevisionCard knownRevision={summary} />);

    expect(screen.getByText(/2 due for revision/)).toBeInTheDocument();
    expect(screen.getByText(/67\. Al-Mulk/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Revise/ })).toHaveAttribute(
      "href",
      "/reader/67?verse=67:1"
    );

    await user.click(screen.getByRole("button", { name: /Mark revised/ }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/known-revision",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ surahId: 67 }),
      })
    );
    expect(await screen.findByRole("status")).toHaveTextContent(/Revised 2 verses in Al-Mulk/);
  });

  it("shows upcoming check-in advice when no known verses are due yet", () => {
    const future = new Date(Date.now() + 10 * 86_400_000).toISOString();
    renderWithQuery(
      <KnownRevisionCard
        knownRevision={{
          totalKnown: 7,
          dueCount: 0,
          revisedRecently: 7,
          nextDueAt: future,
          dueItems: [],
        }}
      />
    );

    expect(screen.getByText("All caught up")).toBeInTheDocument();
    expect(screen.getByText(/Your 7 known verses are on track/)).toBeInTheDocument();
  });
});
