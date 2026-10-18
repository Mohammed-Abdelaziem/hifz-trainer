import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SabaqIntake } from "@/components/dashboard/SabaqIntake";

const baqarah = { id: 2, name_simple: "Al-Baqarah", ayah_count: 286 };
const ikhlas = { id: 112, name_simple: "Al-Ikhlas", ayah_count: 4 };

function renderIntake(surahs = [baqarah, ikhlas]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SabaqIntake availableSurahs={surahs} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({ ok: true, changed: 0, created: 5, alreadyKnown: 0, invalid: 0 }),
      { status: 200 },
    )
  ));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SabaqIntake", () => {
  it("starts in Sabaq mode with a valid default range", () => {
    renderIntake();
    const button = screen.getByRole("button", { name: /^Add 5/ });
    expect(button).toBeEnabled();
  });

  it("shows an inline reason when From is after To", async () => {
    const user = userEvent.setup();
    renderIntake([ikhlas]);
    const from = screen.getByLabelText("From ayah");
    const to = screen.getByLabelText("To ayah");
    await user.clear(from);
    await user.type(from, "3");
    await user.clear(to);
    await user.type(to, "1");
    expect(
      screen.getByText(/"To" must not be before "From"/)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Add/ })).toBeDisabled();
  });

  it("rejects a To beyond the surah's own ayah count", async () => {
    const user = userEvent.setup();
    renderIntake([ikhlas]);
    const to = screen.getByLabelText("To ayah");
    await user.clear(to);
    await user.type(to, "9");
    expect(screen.getByText(/Al-Ikhlas has 4 ayahs/)).toBeInTheDocument();
  });

  it("caps Sabaq additions and explains the split", async () => {
    const user = userEvent.setup();
    renderIntake();
    const to = screen.getByLabelText("To ayah");
    await user.clear(to);
    await user.type(to, "60");
    expect(
      screen.getByText(/Up to 50 verses per request — split the range/)
    ).toBeInTheDocument();
  });

  it("marking-known mode widens the cap and posts to /api/memory-state", async () => {
    const user = userEvent.setup();
    renderIntake();
    const to = screen.getByLabelText("To ayah");
    await user.clear(to);
    await user.type(to, "60");
    // 60 > the Sabaq cap of 50: invalid in normal mode, valid once known.
    expect(screen.getByLabelText(/I already know this/)).not.toBeChecked();
    await user.click(screen.getByLabelText(/I already know this/));
    expect(screen.getByRole("button", { name: /^Mark known 60/ })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /^Mark known 60/ }));
    await waitFor(() => {
      expect(screen.getByText(/5 labeled known/)).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/memory-state",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ surahId: 2, fromAyah: 1, toAyah: 60, known: true }),
      })
    );
  });

  it("tells guests to sign in", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );
    const user = userEvent.setup();
    renderIntake([ikhlas]);
    // Defaults end at ayah 5, beyond Al-Ikhlas's 4 — fix the range first or
    // the button stays disabled and the fetch never fires.
    const to = screen.getByLabelText("To ayah");
    await user.clear(to);
    await user.type(to, "4");
    await user.click(screen.getByLabelText(/I already know this/));
    await user.click(screen.getByRole("button", { name: /^Mark known/ }));
    expect(await screen.findByText("Sign in to mark verses as known")).toBeInTheDocument();
  });

  it("reports verses that are not in the Quran", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: true, changed: 0, created: 0, alreadyKnown: 0, invalid: 1 }),
        { status: 200 },
      )
    );
    const user = userEvent.setup();
    renderIntake([ikhlas]);
    const to = screen.getByLabelText("To ayah");
    await user.clear(to);
    await user.type(to, "4");
    await user.click(screen.getByLabelText(/I already know this/));
    await user.click(screen.getByRole("button", { name: /^Mark known/ }));
    expect(await screen.findByText(/1 not in the Quran/)).toBeInTheDocument();
  });
});
