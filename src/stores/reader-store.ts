"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LayoutMode, MaskMode, PlaybackMode } from "@/types/quran";
import { DEFAULT_RECITER_ID } from "@/lib/quran/reciters";

interface ReaderSettings {
  maskMode: MaskMode;
  layoutMode: LayoutMode;
  playbackMode: PlaybackMode;
  showTranslation: boolean;
  showRoots: boolean;
  fontSizePx: number;
  speed: number;
  volume: number;
  reciterId: number;
  continuousPlay: boolean;
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
  setLayoutMode: (m: LayoutMode) => void;
  setPlaybackMode: (m: PlaybackMode) => void;
  toggleTranslation: () => void;
  toggleRoots: () => void;
  setFontSize: (px: number) => void;
  setSpeed: (x: number) => void;
  setVolume: (v: number) => void;
  setReciterId: (id: number) => void;
  setContinuousPlay: (on: boolean) => void;
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
  layoutMode: "FLOW" as LayoutMode,
  playbackMode: "continuous" as PlaybackMode,
  showTranslation: false,
  showRoots: false,
  fontSizePx: 32,
  speed: 1,
  volume: 1,
  reciterId: DEFAULT_RECITER_ID,
  continuousPlay: false,
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
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setPlaybackMode: (playbackMode) =>
        set({ playbackMode, forcedActiveIndex: null, loopA: null, loopB: null }),
      toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
      toggleRoots: () => set((s) => ({ showRoots: !s.showRoots })),
      setFontSize: (fontSizePx) =>
        set({ fontSizePx: Math.min(56, Math.max(22, fontSizePx)) }),
      setSpeed: (speed) => set({ speed: Math.min(1.5, Math.max(0.5, speed)) }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
      setReciterId: (reciterId) => set({ reciterId }),
      setContinuousPlay: (continuousPlay) => set({ continuousPlay }),

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
        layoutMode: s.layoutMode,
        playbackMode: s.playbackMode,
        showTranslation: s.showTranslation,
        showRoots: s.showRoots,
        fontSizePx: s.fontSizePx,
        speed: s.speed,
        volume: s.volume,
        reciterId: s.reciterId,
        continuousPlay: s.continuousPlay,
      }),
    }
  )
);
