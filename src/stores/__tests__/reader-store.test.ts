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

describe("reader-store — bulk verse selection", () => {
  beforeEach(() => {
    useReaderStore.setState(
      { bulkMode: false, bulkSelected: [] },
      false
    );
  });

  it("starts with bulk mode off and nothing selected", () => {
    expect(useReaderStore.getState().bulkMode).toBe(false);
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });

  it("entering the mode resets any stale selection", () => {
    useReaderStore.setState({ bulkSelected: ["1:1"] }, false);
    useReaderStore.getState().setBulkMode(true);
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });

  it("leaving the mode clears the selection too", () => {
    useReaderStore.getState().setBulkMode(true);
    useReaderStore.getState().toggleBulkVerse("112:1");
    useReaderStore.getState().setBulkMode(false);
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });

  it("toggles membership", () => {
    const { toggleBulkVerse } = useReaderStore.getState();
    toggleBulkVerse("112:1");
    toggleBulkVerse("112:2");
    expect(useReaderStore.getState().bulkSelected).toEqual(["112:1", "112:2"]);
    toggleBulkVerse("112:1");
    expect(useReaderStore.getState().bulkSelected).toEqual(["112:2"]);
  });

  it("replaces the selection on an explicit range (shift-click)", () => {
    useReaderStore.getState().toggleBulkVerse("1:1");
    useReaderStore.getState().setBulkRange(["1:2", "1:3", "1:4"]);
    expect(useReaderStore.getState().bulkSelected).toEqual(["1:2", "1:3", "1:4"]);
  });

  it("selectBulkAll and clearBulkSelection round-trip", () => {
    useReaderStore.getState().selectBulkAll(["1:1", "1:2"]);
    expect(useReaderStore.getState().bulkSelected).toEqual(["1:1", "1:2"]);
    useReaderStore.getState().clearBulkSelection();
    expect(useReaderStore.getState().bulkSelected).toEqual([]);
  });

  it("bulk state is never persisted", async () => {
    useReaderStore.getState().setBulkMode(true);
    useReaderStore.getState().toggleBulkVerse("112:1");
    // Force a write by rehydrating from the current persisted snapshot.
    const raw = localStorage.getItem("reader-settings");
    expect(raw && JSON.parse(raw).state.bulkMode).toBeUndefined();
    expect(raw && JSON.parse(raw).state.bulkSelected).toBeUndefined();
    useReaderStore.getState().setBulkMode(false);
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
