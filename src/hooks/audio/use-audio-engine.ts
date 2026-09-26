"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
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

  // Callers pass inline callbacks and often omit availableSurahs, so all three
  // change identity every render. Holding them in refs keeps the effects below
  // from re-running (and re-fetching verse timings) on every render.
  const onVerseChangeRef = useRef(onVerseChange);
  const surahUrlRef = useRef(surahUrl);
  const availableSurahsRef = useRef(availableSurahs);

  useEffect(() => {
    onVerseChangeRef.current = onVerseChange;
    surahUrlRef.current = surahUrl;
    availableSurahsRef.current = availableSurahs;
  });

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
        onVerseChangeRef.current?.();
        queueMicrotask(() => engine.play());
      } else {
        const surahs = availableSurahsRef.current;
        const surahIdx = surahs.findIndex((s) => s.id === surah.id);
        const nextSurah = surahIdx >= 0 && surahIdx < surahs.length - 1
          ? surahs[surahIdx + 1]
          : null;
        if (nextSurah) {
          window.location.href = surahUrlRef.current(nextSurah.id);
        }
      }
    });
  }, [engine, continuousPlay, hasAyahs, selected, surah.ayahs, surah.id, selectAyah, resetRevealed]);

  useEffect(() => {
    if (surahAudioMode && hasAyahs) {
      engine.onVerseChange((verseKey) => {
        selectAyah(verseKey);
        resetRevealed(verseKey);
        onVerseChangeRef.current?.();
      });
      let cancelled = false;
      void fetchVerseTimings(surah.id, reciterId, surah.ayah_count).then((timings) => {
        if (cancelled) return;
        engine.setSurahTimings(timings);
      });
      return () => {
        cancelled = true;
        engine.onVerseChange(null);
        engine.clearSurahTimings();
      };
    }
    engine.onVerseChange(null);
    engine.clearSurahTimings();
    return undefined;
  }, [engine, surahAudioMode, hasAyahs, surah.id, surah.ayah_count, reciterId, selectAyah, resetRevealed]);

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
