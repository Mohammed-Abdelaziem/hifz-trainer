import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { useReaderStore } from "@/stores/reader-store";
import type { VerseTiming } from "@/lib/audio/full-surah";
import type { AudioEngine } from "@/lib/audio/engine";

const VERSE_TIMINGS: VerseTiming[] = [
  { verseKey: "19:1", start_ms: 0, end_ms: 10_000 },
  { verseKey: "19:2", start_ms: 10_000, end_ms: 20_000 },
];

type EngineMock = AudioEngine & { checkVerseChange: ReturnType<typeof vi.fn> };

function makeEngine(isPlaying: boolean): EngineMock {
  return {
    isPlaying: vi.fn(() => isPlaying),
    nowMs: vi.fn(() => 10_500),
    durationMs: vi.fn(() => null),
    checkVerseChange: vi.fn(),
    pause: vi.fn(),
  } as unknown as EngineMock;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  useReaderStore.setState({
    surahAudioMode: true,
    forcedActiveIndex: null,
    loopA: null,
    loopB: null,
  });
});

afterEach(() => {
  useReaderStore.setState({
    surahAudioMode: false,
    forcedActiveIndex: null,
  });
});

describe("AudioSyncProvider tick", () => {
  it("detects verse crossings while playing in surah-audio mode", async () => {
    const engine = makeEngine(true);
    render(<AudioSyncProvider engine={engine} timings={[]} verseTimings={VERSE_TIMINGS}>null</AudioSyncProvider>);

    await wait(140);
    // The 50ms interval grants at least two ticks inside a 140ms window.
    expect(engine.checkVerseChange.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("does not detect crossings while paused, so seeking keeps the manual selection", async () => {
    const engine = makeEngine(false);
    render(<AudioSyncProvider engine={engine} timings={[]} verseTimings={VERSE_TIMINGS}>null</AudioSyncProvider>);

    await wait(140);
    expect(engine.checkVerseChange).not.toHaveBeenCalled();
  });

  it("does not detect crossings outside surah-audio mode", async () => {
    useReaderStore.setState({ surahAudioMode: false });
    const engine = makeEngine(true);
    render(<AudioSyncProvider engine={engine} timings={[]} verseTimings={VERSE_TIMINGS}>null</AudioSyncProvider>);

    await wait(140);
    expect(engine.checkVerseChange).not.toHaveBeenCalled();
  });
});
