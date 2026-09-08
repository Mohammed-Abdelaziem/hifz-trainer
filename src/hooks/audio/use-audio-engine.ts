"use client";

import { useEffect, useMemo, useCallback } from "react";
import { AudioEngine } from "@/lib/audio/engine";
import { fetchVerseTimings } from "@/lib/audio/full-surah";
import type { Ayah, SurahBundle } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";

export interface UseAudioEngineOptions {
  surah: SurahBundle;
  selected: Ayah | null;
  hasAyahs: boolean;
  enableKeyboard?: boolean;
  onVerseChange?: () => void;
  availableSurahs?: { id: number }[];
  surahUrl?: (surahId: number) => string;
}

export function useAudioEngine({
  surah,
  selected,
  hasAyahs,
  enableKeyboard = true,
  onVerseChange,
  availableSurahs = [],
  surahUrl = (id) => `/reader/${id}`,
}: UseAudioEngineOptions): AudioEngine {
  const engine = useMemo(() => new AudioEngine(), []);

  const continuousPlay = useReaderStore((s) => s.continuousPlay);
  const surahAudioMode = useReaderStore((s) => s.surahAudioMode);
  const reciterId = useReaderStore((s) => s.reciterId);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);

  useEffect(() => {
    engine.onEnd(() => {
      if (!continuousPlay || !hasAyahs || !selected) return;
      const idx = surah.ayahs.findIndex((a) => a.verse_key === selected.verse_key);
      if (idx < 0) return;
      if (idx + 1 < surah.ayahs.length) {
        const next = surah.ayahs[idx + 1];
        selectAyah(next.verse_key);
        resetRevealed(next.verse_key);
        onVerseChange?.();
        queueMicrotask(() => engine.play());
      } else {
        const surahIdx = availableSurahs.findIndex((s) => s.id === surah.id);
        const nextSurah = surahIdx >= 0 && surahIdx < availableSurahs.length - 1
          ? availableSurahs[surahIdx + 1]
          : null;
        if (nextSurah) {
          window.location.href = surahUrl(nextSurah.id);
        }
      }
    });
  }, [engine, continuousPlay, hasAyahs, selected, surah.ayahs, surah.id, selectAyah, resetRevealed, onVerseChange, availableSurahs, surahUrl]);

  useEffect(() => {
    if (surahAudioMode && hasAyahs) {
      engine.onVerseChange((verseKey) => {
        selectAyah(verseKey);
        resetRevealed(verseKey);
        onVerseChange?.();
      });
      void fetchVerseTimings(surah.id, reciterId, surah.ayah_count).then((timings) => {
        engine.setSurahTimings(timings);
      });
    } else {
      engine.onVerseChange(null);
      engine.clearSurahTimings();
    }
    return () => {
      engine.onVerseChange(null);
      engine.clearSurahTimings();
    };
  }, [engine, surahAudioMode, hasAyahs, surah.id, surah.ayah_count, reciterId, selectAyah, resetRevealed, onVerseChange]);

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
