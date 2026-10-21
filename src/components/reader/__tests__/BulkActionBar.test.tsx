import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkActionBar } from "@/components/reader/BulkActionBar";
import { useReaderStore } from "@/stores/reader-store";

const ALL_KEYS = ["112:1", "112:2", "112:3", "112:4"];

function setSelection(keys: string[]) {
  useReaderStore.setState({ bulkMode: true, bulkSelected: keys }, false);
}

describe("BulkActionBar", () => {
  beforeEach(() => {
    setSelection([]);
    vi.restoreAllMocks();
  });

  it("shows the selection count and disables actions while empty", () => {
    render(
      <BulkActionBar
        allKeys={ALL_KEYS}
        isGuest={false}
        onResult={vi.fn()}
        onProgressChange={vi.fn()}
      />
    );
    expect(screen.getByText("0 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mark known/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Add to Sabaq/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });

  it("marks known via POST /api/memory-state and clears the selection", async () => {
    const user = userEvent.setup();
    setSelection(["112:1", "112:2"]);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, changed: 2 }), { status: 200 })
      );
    const onResult = vi.fn();
    const onProgressChange = vi.fn();
    render(
      <BulkActionBar
        allKeys={ALL_KEYS}
        isGuest={false}
        onResult={onResult}
        onProgressChange={onProgressChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /Mark known/ }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/memory-state");
    expect(init?.method).toBe("POST");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.verseKeys).toEqual(["112:1", "112:2"]);
    expect(body.known).toBe(true);
    expect(onResult).toHaveBeenCalledWith("Marked 2 verses known");
    expect(onProgressChange).toHaveBeenCalledTimes(1);
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });

  it("chunks oversized selections across Sabaq requests in order", async () => {
    const user = userEvent.setup();
    const big = Array.from({ length: 120 }, (_, i) => `112:${i + 1}`);
    setSelection(big);
    const bodies: string[][] = [];
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      bodies.push(JSON.parse((init as RequestInit).body as string).verseKeys);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    render(
      <BulkActionBar allKeys={big} isGuest={false} onResult={vi.fn()} onProgressChange={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: /Add to Sabaq/ }));

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(bodies[0]).toHaveLength(50);
    expect(bodies[2]).toHaveLength(20);
    expect(bodies.flat()).toEqual(big);
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });

  it("keeps the selection when the server error is total", async () => {
    const user = userEvent.setup();
    setSelection(["112:1"]);
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const onResult = vi.fn();
    render(
      <BulkActionBar
        allKeys={ALL_KEYS}
        isGuest={false}
        onResult={onResult}
        onProgressChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Mark known/ }));

    expect(onResult).toHaveBeenCalledWith("Could not reach the server — selection kept");
    expect(useReaderStore.getState().bulkSelected).toEqual(["112:1"]);
  });

  it("flashes a sign-in hint for guests instead of sending a request", async () => {
    const user = userEvent.setup();
    setSelection(["112:1"]);
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const onResult = vi.fn();
    render(
      <BulkActionBar
        allKeys={ALL_KEYS}
        isGuest={true}
        onResult={onResult}
        onProgressChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Mark known/ }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith("Sign in to mark verses as known");
    expect(useReaderStore.getState().bulkSelected).toEqual(["112:1"]);
  });

  it("exits selection mode with X, and Select all takes every verse", async () => {
    const user = userEvent.setup();
    setSelection(["112:1"]);
    render(
      <BulkActionBar
        allKeys={ALL_KEYS}
        isGuest={false}
        onResult={vi.fn()}
        onProgressChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Select all" }));
    expect(useReaderStore.getState().bulkSelected).toEqual(ALL_KEYS);
    expect(screen.getByRole("button", { name: "Select all" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Exit selection mode" }));
    expect(useReaderStore.getState().bulkMode).toBe(false);
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });
});
