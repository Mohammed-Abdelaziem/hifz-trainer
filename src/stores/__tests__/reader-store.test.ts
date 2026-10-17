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
});
