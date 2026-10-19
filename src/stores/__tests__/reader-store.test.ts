import { describe, expect, it, beforeEach } from "vitest";
import { useReaderStore } from "@/stores/reader-store";

const RESET = {
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

describe("reader-store — auto-advance toggle", () => {
  beforeEach(() => {
    useReaderStore.setState({ autoAdvance: true }, false);
  });

  it("defaults to on so continuous listening keeps moving", () => {
    expect(useReaderStore.getState().autoAdvance).toBe(true);
  });

  it("round-trips on and off", () => {
    useReaderStore.getState().setAutoAdvance(false);
    expect(useReaderStore.getState().autoAdvance).toBe(false);
    useReaderStore.getState().setAutoAdvance(true);
    expect(useReaderStore.getState().autoAdvance).toBe(true);
  });

  it("rehydrates a persisted false over an in-memory true", async () => {
    useReaderStore.setState({ autoAdvance: true }, false);
    localStorage.setItem(
      "reader-settings",
      JSON.stringify({
        state: { ...DEFAULT_STUB, autoAdvance: false },
        version: 0,
      })
    );

    await useReaderStore.persist.rehydrate();
    expect(useReaderStore.getState().autoAdvance).toBe(false);
  });

  it("drops junk persisted values back to the in-memory default", async () => {
    useReaderStore.setState({ autoAdvance: true }, false);
    localStorage.setItem(
      "reader-settings",
      JSON.stringify({
        state: { ...DEFAULT_STUB, autoAdvance: "nope" },
        version: 0,
      })
    );

    await useReaderStore.persist.rehydrate();
    expect(useReaderStore.getState().autoAdvance).toBe(true);
  });
});

const DEFAULT_STUB = {
  maskMode: "HIDDEN",
  blurScope: "word",
  layoutMode: "FLOW",
  playbackMode: "continuous",
  showRoots: false,
  fontSizePx: 32,
  speed: 1,
  volume: 1,
  reciterId: 7,
  continuousPlay: false,
  surahAudioMode: false,
};
