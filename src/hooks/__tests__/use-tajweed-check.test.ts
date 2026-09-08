import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTajweedCheck } from "@/hooks/use-tajweed-check";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useTajweedCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useTajweedCheck());
    expect(result.current.isChecking).toBe(false);
    expect(result.current.result).toBeNull();
  });

  it("sets isChecking to true during request", async () => {
    let resolveFetch!: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { result } = renderHook(() => useTajweedCheck());

    act(() => {
      result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(result.current.isChecking).toBe(true);

    await act(async () => {
      resolveFetch({
        ok: true,
        json: () => Promise.resolve({ transcription: "test", score: 85, issues: [] }),
      });
    });

    expect(result.current.isChecking).toBe(false);
  });

  it("returns result on success", async () => {
    const mockResult = {
      transcription: "بِسْمِ اللَّهِ",
      score: 90,
      issues: [{ rule: "Test", severity: "info", message: "Good", suggestion: "Keep going" }],
      similarity: 85.5,
      reference: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      await result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(result.current.result).toEqual(mockResult);
  });

  it("returns error on fetch failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      await result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(result.current.result?.error).toBeTruthy();
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      await result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(result.current.result?.error).toContain("Network error");
  });

  it("aborts request after timeout", { timeout: 15000 }, async () => {
    mockFetch.mockImplementation((_url: string, opts?: { signal?: AbortSignal }) => {
      return new Promise((_resolve, reject) => {
        if (opts?.signal) {
          if (opts.signal.aborted) {
            reject(new DOMException("The operation was aborted.", "AbortError"));
            return;
          }
          opts.signal.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }
      });
    });

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(result.current.isChecking).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(61000);
    });

    expect(result.current.result?.error).toContain("timed out");
    expect(result.current.isChecking).toBe(false);
  });

  it("sends correct FormData", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ transcription: "test", score: 50, issues: [] }),
    });

    const { result } = renderHook(() => useTajweedCheck());
    const audioBlob = new Blob(["fake audio"], { type: "audio/webm" });

    await act(async () => {
      await result.current.checkRecitation(audioBlob, "2:3");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tajweed",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    const formData = callArgs[1].body as FormData;
    expect(formData.get("verseKey")).toBe("2:3");
  });

  it("reset clears state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ transcription: "test", score: 70, issues: [] }),
    });

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      await result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.isChecking).toBe(false);
  });

  it("returns score as a number", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ transcription: "test", score: 75.5, issues: [] }),
    });

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      await result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(typeof result.current.result?.score).toBe("number");
  });

  it("returns issues as an array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          transcription: "test",
          score: 60,
          issues: [
            { rule: "Madd", severity: "warning", message: "Too fast", suggestion: "Slow down" },
          ],
        }),
    });

    const { result } = renderHook(() => useTajweedCheck());

    await act(async () => {
      await result.current.checkRecitation(
        new Blob(["audio"], { type: "audio/webm" }),
        "1:1"
      );
    });

    expect(Array.isArray(result.current.result?.issues)).toBe(true);
    expect(result.current.result?.issues?.length).toBeGreaterThan(0);
  });
});
