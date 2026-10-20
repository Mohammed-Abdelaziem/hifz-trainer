"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BlurScope, LayoutMode, MaskMode, PlaybackMode } from "@/types/quran";
import { DEFAULT_RECITER_ID, VALID_RECITER_IDS } from "@/lib/quran/reciters";
import {
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
  SPEED_MIN,
  SPEED_MAX,
  VOLUME_MIN,
  VOLUME_MAX,
} from "@/lib/constants";

interface ReaderSettings {
  maskMode: MaskMode;
  blurScope: BlurScope;
  layoutMode: LayoutMode;
  playbackMode: PlaybackMode;
  showVerseTranslation: boolean;
  showRoots: boolean;
  fontSizePx: number;
  speed: number;
  volume: number;
  reciterId: number;
  continuousPlay: boolean;
  surahAudioMode: boolean;
  autoAdvance: boolean;
  /**
   * Extra replays of the loaded audio at natural end. 0 = off, n = n extra
   * plays (2 = three listens), -1 = loop until stopped. Lives on the
   * AudioEngine via setRepeat; -1 survives persistence as -1 (never Infinity,
   * which JSON.stringify turns into null).
   */
  repeatTotal: number;
}

interface ReaderSessionState {
  selectedVerseKey: string;
  revealedWords: Set<string>;
  loopA: number | null;
  loopB: number | null;
  tafsirOpen: boolean;
  helpOpen: boolean;
  forcedActiveIndex: number | null;
}

interface ReaderStore extends ReaderSettings, ReaderSessionState {
  setMaskMode: (m: MaskMode) => void;
  setBlurScope: (s: BlurScope) => void;
  setLayoutMode: (m: LayoutMode) => void;
  setPlaybackMode: (m: PlaybackMode) => void;
  toggleVerseTranslation: () => void;
  toggleRoots: () => void;
  setFontSize: (px: number) => void;
  setSpeed: (x: number) => void;
  setVolume: (v: number) => void;
  setReciterId: (id: number) => void;
  setContinuousPlay: (on: boolean) => void;
  setSurahAudioMode: (on: boolean) => void;
  setAutoAdvance: (on: boolean) => void;
  setRepeatTotal: (n: number) => void;
  selectAyah: (verseKey: string) => void;
  revealWord: (wordId: string) => void;
  revealAll: (wordIds: string[]) => void;
  resetRevealed: (verseKey: string) => void;
  setLoopA: (ms: number) => void;
  setLoopB: (ms: number) => void;
  clearLoop: () => void;
  setTafsirOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setForcedActiveIndex: (i: number | null) => void;
}

const DEFAULT_SETTINGS = {
  maskMode: "BLUR" as MaskMode,
  blurScope: "word" as BlurScope,
  layoutMode: "FLOW" as LayoutMode,
  playbackMode: "continuous" as PlaybackMode,
  showVerseTranslation: false,
  showRoots: false,
  fontSizePx: FONT_SIZE_DEFAULT,
  speed: 1,
  volume: 1,
  reciterId: DEFAULT_RECITER_ID,
  continuousPlay: false,
  surahAudioMode: false,
  autoAdvance: true,
  repeatTotal: 0,
} satisfies Partial<ReaderSettings>;

type PersistedSettings = Pick<
  ReaderSettings,
  | "maskMode"
  | "blurScope"
  | "layoutMode"
  | "playbackMode"
  | "showVerseTranslation"
  | "showRoots"
  | "fontSizePx"
  | "speed"
  | "volume"
  | "reciterId"
  | "continuousPlay"
  | "surahAudioMode"
  | "autoAdvance"
  | "repeatTotal"
>;

const MASK_MODES: MaskMode[] = ["FULL", "BLUR", "FIRST_LETTER", "REVEAL"];
const BLUR_SCOPES: BlurScope[] = ["ayah", "word"];
const LAYOUT_MODES: LayoutMode[] = ["FLOW", "MUSHAF"];
const PLAYBACK_MODES: PlaybackMode[] = ["continuous", "word"];

const oneOf = <T extends string>(modes: T[], value: unknown): T | null =>
  modes.find((m) => value === m) ?? null;

const isBool = (v: unknown): v is boolean => v === true || v === false;

/** The exact options the audio bar exposes; anything else falls back to off. */
const REPEAT_TOTALS = [-1, 0, 3, 5];

/**
 * localStorage data has no schema: hand-edited, older-app or corrupt values
 * used to bubble straight into runtime state (a bad `maskMode` for instance
 * masked nothing a user could recover from the UI). Every persisted key is
 * re-validated or replaced with the default, and clamped fields are re
 * clamped.
 */
function sanitizePersisted(persisted: unknown): Partial<PersistedSettings> {
  const out: Partial<PersistedSettings> = {};
  if (typeof persisted !== "object" || persisted === null) return out;

  const p = persisted as Record<string, unknown>;
  const mask = oneOf(MASK_MODES, p.maskMode);
  if (mask) out.maskMode = mask;
  const blurScope = oneOf(BLUR_SCOPES, p.blurScope);
  if (blurScope) out.blurScope = blurScope;
  const layout = oneOf(LAYOUT_MODES, p.layoutMode);
  if (layout) out.layoutMode = layout;
  const playback = oneOf(PLAYBACK_MODES, p.playbackMode);
  if (playback) out.playbackMode = playback;
  if (isBool(p.showVerseTranslation)) out.showVerseTranslation = p.showVerseTranslation;
  if (isBool(p.showRoots)) out.showRoots = p.showRoots;
  if (isBool(p.continuousPlay)) out.continuousPlay = p.continuousPlay;
  if (isBool(p.surahAudioMode)) out.surahAudioMode = p.surahAudioMode;
  if (isBool(p.autoAdvance)) out.autoAdvance = p.autoAdvance;
  if (
    typeof p.repeatTotal === "number" &&
    Number.isInteger(p.repeatTotal) &&
    REPEAT_TOTALS.includes(p.repeatTotal)
  ) {
    out.repeatTotal = p.repeatTotal;
  }
  if (typeof p.fontSizePx === "number" && Number.isFinite(p.fontSizePx)) {
    out.fontSizePx = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, p.fontSizePx));
  }
  if (typeof p.speed === "number" && Number.isFinite(p.speed)) {
    out.speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, p.speed));
  }
  if (typeof p.volume === "number" && Number.isFinite(p.volume)) {
    out.volume = Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, p.volume));
  }
  if (typeof p.reciterId === "number" && Number.isInteger(p.reciterId) && VALID_RECITER_IDS.has(p.reciterId)) {
    out.reciterId = p.reciterId;
  }
  return out;
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      selectedVerseKey: "",
      revealedWords: new Set<string>(),
      loopA: null,
      loopB: null,
      tafsirOpen: false,
      helpOpen: false,
      forcedActiveIndex: null,

      setMaskMode: (maskMode) => set({ maskMode }),
      setBlurScope: (blurScope) => set({ blurScope }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setPlaybackMode: (playbackMode) =>
        set({ playbackMode, forcedActiveIndex: null, loopA: null, loopB: null }),
      toggleVerseTranslation: () =>
        set((s) => ({ showVerseTranslation: !s.showVerseTranslation })),
      toggleRoots: () => set((s) => ({ showRoots: !s.showRoots })),
      setFontSize: (fontSizePx) =>
        set({ fontSizePx: Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, fontSizePx)) }),
      setSpeed: (speed) => set({ speed: Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed)) }),
      setVolume: (volume) => set({ volume: Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, volume)) }),
      setReciterId: (reciterId) => set({ reciterId }),
      setContinuousPlay: (continuousPlay) => set({ continuousPlay }),
      setSurahAudioMode: (surahAudioMode) => set({ surahAudioMode }),
      setAutoAdvance: (autoAdvance) => set({ autoAdvance }),
      setRepeatTotal: (repeatTotal) => {
        if (REPEAT_TOTALS.includes(repeatTotal)) set({ repeatTotal });
      },

      selectAyah: (selectedVerseKey) =>
        set({
          selectedVerseKey,
          loopA: null,
          loopB: null,
          tafsirOpen: false,
        }),

      revealWord: (wordId) =>
        set((s) => {
          if (s.revealedWords.has(wordId)) return s;
          const next = new Set(s.revealedWords);
          next.add(wordId);
          return { revealedWords: next };
        }),

      revealAll: (wordIds) =>
        set((s) => {
          const next = new Set(s.revealedWords);
          for (const id of wordIds) next.add(id);
          return { revealedWords: next };
        }),

      resetRevealed: (verseKey) =>
        set((s) => {
          const prefix = `${verseKey}:`;
          const next = new Set<string>();
          for (const id of s.revealedWords) {
            if (!id.startsWith(prefix)) next.add(id);
          }
          return { revealedWords: next };
        }),

      setLoopA: (ms) => {
        const b = get().loopB;
        set({ loopA: ms, ...(b !== null && ms >= b ? { loopB: null } : {}) });
      },
      setLoopB: (ms) => {
        const a = get().loopA;
        set({ loopB: a !== null && ms <= a ? null : ms });
      },
      clearLoop: () => set({ loopA: null, loopB: null }),
      setTafsirOpen: (tafsirOpen) => set({ tafsirOpen }),
      setHelpOpen: (helpOpen) => set({ helpOpen }),
      setForcedActiveIndex: (forcedActiveIndex) => set({ forcedActiveIndex }),
    }),
    {
      name: "reader-settings",
      // v0 blobs (written before this version existed) and any junk hand-edited
      // into localStorage pass through migrate() → sanitizePersisted(), which
      // drops unknown values back to defaults. Skipping this was how a corrupt
      // `maskMode` could silently render every word unmasked with no way to
      // recover from the UI.
      version: 1,
      migrate: (persisted) => sanitizePersisted(persisted) as PersistedSettings,
      skipHydration: true,
      partialize: (s) => ({
        maskMode: s.maskMode,
        blurScope: s.blurScope,
        layoutMode: s.layoutMode,
        playbackMode: s.playbackMode,
        showVerseTranslation: s.showVerseTranslation,
        showRoots: s.showRoots,
        fontSizePx: s.fontSizePx,
        speed: s.speed,
        volume: s.volume,
        reciterId: s.reciterId,
        continuousPlay: s.continuousPlay,
        surahAudioMode: s.surahAudioMode,
        autoAdvance: s.autoAdvance,
        repeatTotal: s.repeatTotal,
      }),
    }
  )
);
