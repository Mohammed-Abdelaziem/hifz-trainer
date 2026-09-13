"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BlurScope, LayoutMode, MaskMode, PlaybackMode } from "@/types/quran";
import { DEFAULT_RECITER_ID } from "@/lib/quran/reciters";
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
  showTranslation: boolean;
  showRoots: boolean;
  fontSizePx: number;
  speed: number;
  volume: number;
  reciterId: number;
  continuousPlay: boolean;
  surahAudioMode: boolean;
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
  toggleTranslation: () => void;
  toggleRoots: () => void;
  setFontSize: (px: number) => void;
  setSpeed: (x: number) => void;
  setVolume: (v: number) => void;
  setReciterId: (id: number) => void;
  setContinuousPlay: (on: boolean) => void;
  setSurahAudioMode: (on: boolean) => void;
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
  showTranslation: false,
  showRoots: false,
  fontSizePx: FONT_SIZE_DEFAULT,
  speed: 1,
  volume: 1,
  reciterId: DEFAULT_RECITER_ID,
  continuousPlay: false,
  surahAudioMode: false,
};

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
      toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
      toggleRoots: () => set((s) => ({ showRoots: !s.showRoots })),
      setFontSize: (fontSizePx) =>
        set({ fontSizePx: Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, fontSizePx)) }),
      setSpeed: (speed) => set({ speed: Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed)) }),
      setVolume: (volume) => set({ volume: Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, volume)) }),
      setReciterId: (reciterId) => set({ reciterId }),
      setContinuousPlay: (continuousPlay) => set({ continuousPlay }),
      setSurahAudioMode: (surahAudioMode) => set({ surahAudioMode }),

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
      skipHydration: true,
      partialize: (s) => ({
        maskMode: s.maskMode,
        blurScope: s.blurScope,
        layoutMode: s.layoutMode,
        playbackMode: s.playbackMode,
        showTranslation: s.showTranslation,
        showRoots: s.showRoots,
        fontSizePx: s.fontSizePx,
        speed: s.speed,
        volume: s.volume,
        reciterId: s.reciterId,
        continuousPlay: s.continuousPlay,
        surahAudioMode: s.surahAudioMode,
      }),
    }
  )
);
