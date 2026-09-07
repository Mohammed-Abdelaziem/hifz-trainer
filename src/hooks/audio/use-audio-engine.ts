"use client";

import { useEffect, useMemo, useCallback } from "react";
import { AudioEngine } from "@/lib/audio/engine";
import type { Ayah, SurahBundle } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";

export interface UseAudioEngineOptions {
  surah: SurahBundle;
  selected: Ayah | null;
  hasAyahs: boolean;
  enableKeyboard?: boolean;
  onVerseChange?: () => void;
}

export function useAudioEngine({
  surah,
  selected,
  hasAyahs,
  enableKeyboard = true,
  onVerseChange,
}: UseAudioEngineOptions): AudioEngine {
  const engine = useMemo(() => new AudioEngine(), []);

  const continuousPlay = useReaderStore((s) => s.continuousPlay);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);

  useEffect(() => {
    engine.onEnd(() => {
      if (!continuousPlay || !hasAyahs || !selected) return;
      const idx = surah.ayahs.findIndex((a) => a.verse_key === selected.verse_key);
      if (idx < 0) return;
      const next = surah.ayahs[(idx + 1) % surah.ayahs.length];
      if (next.verse_key !== selected.verse_key) {
        selectAyah(next.verse_key);
        resetRevealed(next.verse_key);
        onVerseChange?.();
        queueMicrotask(() => engine.play());
      }
    });
  }, [engine, continuousPlay, hasAyahs, selected, surah.ayahs, selectAyah, resetRevealed, onVerseChange]);

  useEffect(() => {
    return () => engine.destroy();
  }, [engine]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (engine.isPlaying()) engine.pause();
        else engine.play();
      }
    },
    [engine]
  );

  useEffect(() => {
    if (!enableKeyboard) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboard, handleKeyDown]);

  return engine;
}
