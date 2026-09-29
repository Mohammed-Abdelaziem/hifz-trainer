import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePassiveReadingTracker } from "@/hooks/use-passive-reading-tracker";

let fetchMock: ReturnType<typeof vi.fn>;

function readCalls(): { verseKey: string; durationMs: number }[] {
  return fetchMock.mock.calls
    .filter((c) => typeof c[0] === "string" && c[0].includes("/api/reading"))
    .map((c) => JSON.parse((c[1] as { body: string }).body));
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  global.fetch = fetchMock as never;
  Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePassiveReadingTracker", () => {
  it("records every verse when playback advances faster than a 2s debounce", () => {
    const { rerender, unmount } = renderHook(
      ({ key }) => usePassiveReadingTracker(key, true),
      { initialProps: { key: "19:1" as string } }
    );

    // Each verse lasts 1.5s — faster than the old 2s debounce window.
    for (let i = 2; i <= 6; i += 1) {
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      act(() => {
        rerender({ key: `19:${i}` });
      });
    }
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // Unmount flushes the final verse.
    unmount();

    const keys = readCalls().map((c) => c.verseKey);
    for (const key of ["19:1", "19:2", "19:3", "19:4", "19:5", "19:6"]) {
      expect(keys).toContain(key);
    }
  });

  it("sends the full dwell time, not a truncated or zero value", () => {
    const { rerender, unmount } = renderHook(
      ({ key }) => usePassiveReadingTracker(key, true),
      { initialProps: { key: "19:1" as string } }
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      rerender({ key: "19:2" });
    });

    const call = readCalls().find((c) => c.verseKey === "19:1");
    expect(call).toBeDefined();
    expect(call!.durationMs).toBeGreaterThanOrEqual(5000);
    unmount();
  });

  it("ignores verses dwelled on for less than 800ms", () => {
    const { rerender } = renderHook(({ key }) => usePassiveReadingTracker(key, true), {
      initialProps: { key: "19:1" as string },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      rerender({ key: "19:2" });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      rerender({ key: "19:3" });
    });

    expect(readCalls()).toHaveLength(0);
  });

  it("never double-records the same verse key", () => {
    const { rerender } = renderHook(({ key }) => usePassiveReadingTracker(key, true), {
      initialProps: { key: "19:1" as string },
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      rerender({ key: "19:1" });
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      rerender({ key: "19:1" });
    });

    const keys = readCalls().map((c) => c.verseKey).filter((k) => k === "19:1");
    expect(keys.length).toBeLessThanOrEqual(1);
  });

  it("flushes the current verse on unmount", () => {
    const { unmount } = renderHook(() => usePassiveReadingTracker("19:1", true));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    unmount();
    expect(readCalls().map((c) => c.verseKey)).toContain("19:1");
  });

  it("flushes on pagehide so navigation is not lost", () => {
    renderHook(() => usePassiveReadingTracker("19:1", true));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(readCalls().map((c) => c.verseKey)).toContain("19:1");
  });

  it("does nothing when disabled (guests)", () => {
    renderHook(() => usePassiveReadingTracker("19:1", false));
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(readCalls()).toHaveLength(0);
  });

  it("does nothing when there is no verse key", () => {
    renderHook(() => usePassiveReadingTracker(null, true));
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(readCalls()).toHaveLength(0);
  });

  it("skips the request when offline", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const { rerender } = renderHook(({ key }) => usePassiveReadingTracker(key, true), {
      initialProps: { key: "19:1" as string },
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      rerender({ key: "19:2" });
    });
    expect(readCalls()).toHaveLength(0);
  });
});
