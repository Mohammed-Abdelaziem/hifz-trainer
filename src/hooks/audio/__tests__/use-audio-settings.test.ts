import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { AudioEngine } from "@/lib/audio/engine";

const mockEngine = {
  setRate: vi.fn(),
  setVolume: vi.fn(),
  getRate: vi.fn(() => 1),
  getVolume: vi.fn(() => 1),
  onEnd: vi.fn(),
  load: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  destroy: vi.fn(),
  isPlaying: vi.fn(() => false),
  seekMs: vi.fn(),
  nowMs: vi.fn(() => 0),
  durationMs: vi.fn(() => null),
  playClip: vi.fn(),
  abortClips: vi.fn(),
  getMode: vi.fn(() => "idle"),
};

vi.mock("@/stores/reader-store", () => ({
  useReaderStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const store = {
      speed: 1.25,
      volume: 0.8,
      selectedVerseKey: "1:1",
      reciterId: "ar.alafasy",
    };
    return selector(store);
  }),
}));

describe("useAudioSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEngine.setRate.mockImplementation(() => {});
    mockEngine.setVolume.mockImplementation(() => {});
  });

  it("syncs speed to engine on mount", async () => {
    const { useAudioSettings } = await import("@/hooks/audio/use-audio-settings");
    renderHook(() => useAudioSettings(mockEngine as unknown as AudioEngine));
    expect(mockEngine.setRate).toHaveBeenCalledWith(1.25);
  });

  it("syncs volume to engine on mount", async () => {
    const { useAudioSettings } = await import("@/hooks/audio/use-audio-settings");
    renderHook(() => useAudioSettings(mockEngine as unknown as AudioEngine));
    expect(mockEngine.setVolume).toHaveBeenCalledWith(0.8);
  });
});
