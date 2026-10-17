import { describe, expect, it, beforeEach } from "vitest";
import { useReaderStore } from "@/stores/reader-store";

const RESET = {
  showTranslation: false,
  showVerseTranslation: false,
  showRoots: false,
};

describe("reader-store — verse translation toggle", () => {
  beforeEach(() => {
    useReaderStore.setState(RESET, false);
  });

  it("defaults to off so memorization sessions stay untouched", () => {
    expect(useReaderStore.getState().showVerseTranslation).toBe(false);
  });

  it("toggles independently of the word-level translation toggle", () => {
    const { toggleVerseTranslation, toggleTranslation } = useReaderStore.getState();
    toggleVerseTranslation();
    expect(useReaderStore.getState().showVerseTranslation).toBe(true);
    expect(useReaderStore.getState().showTranslation).toBe(false);
    toggleTranslation();
    expect(useReaderStore.getState().showTranslation).toBe(true);
    expect(useReaderStore.getState().showVerseTranslation).toBe(true);
  });

  it("round-trips on and off", () => {
    const { toggleVerseTranslation } = useReaderStore.getState();
    toggleVerseTranslation();
    toggleVerseTranslation();
    expect(useReaderStore.getState().showVerseTranslation).toBe(false);
  });

  it("rehydrates a persisted true over an in-memory false", async () => {
    useReaderStore.setState({ showVerseTranslation: false }, false);
    localStorage.setItem(
      "reader-settings",
      JSON.stringify({
        state: { ...DEFAULT_STUB, showVerseTranslation: true },
        version: 0,
      })
    );
    expect(useReaderStore.getState().showVerseTranslation).toBe(false);

    await useReaderStore.persist.rehydrate();
    expect(useReaderStore.getState().showVerseTranslation).toBe(true);
  });
});

const DEFAULT_STUB = {
  maskMode: "HIDDEN",
  blurScope: "word",
  layoutMode: "FLOW",
  playbackMode: "continuous",
  showTranslation: false,
  showRoots: false,
  fontSizePx: 32,
  speed: 1,
  volume: 1,
  reciterId: 7,
  continuousPlay: false,
  surahAudioMode: false,
};
