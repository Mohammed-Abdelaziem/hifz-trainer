"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { AudioEngine } from "@/lib/audio/engine";
import { fetchVerseTimings } from "@/lib/audio/full-surah";
import type { Ayah, SurahBundle } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";

interface UseAudioEngineOptions {
  surah: SurahBundle;
  selected: Ayah | null;
  hasAyahs: boolean;
  enableKeyboard?: boolean;
  onVerseChange?: () => void;
  availableSurahs?: { id: number }[];
  surahUrl?: (surahId: number) => string;
  /**
   * Called when the whole-surah MP3 finishes (surah-audio mode). Verse-clip
   * playback never reaches this branch, so /reader keeps its verse-level
   * continuous flow and surfaces like /quran advance the tutor's next surah
   * instead.
   */
  onSurahEnd?: () => void;
}

export function useAudioEngine({
  surah,
  selected,
  hasAyahs,
  enableKeyboard = true,
  onVerseChange,
  availableSurahs = [],
  surahUrl = (id) => `/reader/${id}`,
  onSurahEnd,
}: UseAudioEngineOptions): AudioEngine {
  const engine = useMemo(() => new AudioEngine(), []);

  // Callers pass inline callbacks and often omit availableSurahs, so all three
  // change identity every render. Holding them in refs keeps the effects below
  // from re-running (and re-fetching verse timings) on every render.
  const onVerseChangeRef = useRef(onVerseChange);
  const surahUrlRef = useRef(surahUrl);
  const availableSurahsRef = useRef(availableSurahs);
  const onSurahEndRef = useRef(onSurahEnd);

  useEffect(() => {
    onVerseChangeRef.current = onVerseChange;
    surahUrlRef.current = surahUrl;
    availableSurahsRef.current = availableSurahs;
    onSurahEndRef.current = onSurahEnd;
  });

  const continuousPlay = useReaderStore((s) => s.continuousPlay);
  const surahAudioMode = useReaderStore((s) => s.surahAudioMode);
  const reciterId = useReaderStore((s) => s.reciterId);
  const repeatTotal = useReaderStore((s) => s.repeatTotal);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);
  const setForcedActiveIndex = useReaderStore((s) => s.setForcedActiveIndex);

  useEffect(() => {
    engine.setRepeat(repeatTotal);
  }, [engine, repeatTotal]);

  useEffect(() => {
    engine.onEnd(() => {
      // In surah-audio mode the engine just played the whole-surah MP3, so
      // verse-clip continuous logic must not run against a ended surah file
      // (it would "advance" to the next verse and leave the transport stuck).
      // surahAudioMode lives in the deps below, so this read is never stale —
      // the /quran route flips it on right after mount.
      if (surahAudioMode) {
        onSurahEndRef.current?.();
        return;
      }
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
  }, [engine, continuousPlay, surahAudioMode, hasAyahs, selected, surah.ayahs, surah.id, selectAyah, resetRevealed]);

  useEffect(() => {
    if (surahAudioMode && hasAyahs) {
      engine.onVerseChange((verseKey) => {
        selectAyah(verseKey);
        resetRevealed(verseKey);
        // A word pinned for replay belongs to the verse that just finished
        // singing; leaving it set would keep the highlight on the old verse
        // even though selection has moved on.
        setForcedActiveIndex(null);
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
  }, [engine, surahAudioMode, hasAyahs, surah.id, surah.ayah_count, reciterId, selectAyah, resetRevealed, setForcedActiveIndex]);

  useEffect(() => {
    return () => engine.destroy();
  }, [engine]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      // Anything interactive owns the Space key by browser default (buttons
      // activate, ranges slide, selects open). Hijacking Space here made a
      // masked word's Space both reveal AND toggle audio, and a focused rating
      // button grade attempt became a play/pause instead.
      if (
        e.code !== "Space" ||
        target.closest("button, a, select, input, textarea, [role='button'], [role='slider']")
      ) {
        return;
      }
      e.preventDefault();
      if (engine.isPlaying()) engine.pause();
      else engine.playFromVerse(selected?.verse_key ?? "");
    },
    [engine, selected]
  );

  useEffect(() => {
    if (!enableKeyboard) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboard, handleKeyDown]);

  /**
   * Selection-follows-study AND study-follows-selection: while the surah
   * reciter is playing, tapping an ayah (or the grading flow advancing)
   * drags the audio to the verse the reader now has selected. The engine's
   * own verse-crossing callback keeps selection following playback, so this
   * only fires the other way — when the store's selection moves off the
   * verse currently being sung.
   */
  useEffect(() => {
    if (!surahAudioMode || !hasAyahs || !selected) return;
    if (!engine.isPlaying()) return;
    const sung = engine.sungVerseKey();
    if (!sung || sung === selected.verse_key) return;
    // seek = tap-to-jump: the reciter jumps to the tapped ayah immediately
    // instead of the tap only moving the highlight until the next crossing.
    engine.seekToVerse(selected.verse_key);
  }, [engine, surahAudioMode, hasAyahs, selected]);

  /**
   * Preload the next ayah's clip during continuous verse playback: the
   * crossing loads a fresh MP3 that is not in the browser cache's first
   * request, so continuous play previously audibly gapped ("...pause... next
   * verse"). A throwaway Audio element warms the HTTP cache; the engine's
   * load() then resolves from it.
   */
  useEffect(() => {
    if (!continuousPlay || surahAudioMode) return undefined;
    if (typeof Audio === "undefined") return undefined;
    const idx = selected ? surah.ayahs.findIndex((a) => a.verse_key === selected.verse_key) : -1;
    const next = idx >= 0 && idx + 1 < surah.ayahs.length ? surah.ayahs[idx + 1] : null;
    if (!next?.audio_url) return undefined;
    const preload = new Audio();
    preload.preload = "auto";
    preload.src = next.audio_url;
    // Detaching src releases the element's fetch slot; the warmed cache stays.
    return () => {
      preload.removeAttribute("src");
      preload.load();
    };
  }, [continuousPlay, surahAudioMode, surah.ayahs, selected]);

  return engine;
}
