"use client";

import { useEffect, useState } from "react";
import type { AudioEngine } from "@/lib/audio/engine";
import type { VerseTiming } from "@/lib/audio/full-surah";
import { getSurahAudioUrl, fetchVerseTimings } from "@/lib/audio/full-surah";
import type { SurahBundle } from "@/types/quran";

interface UseSurahAudioOptions {
  engine: AudioEngine;
  surah: SurahBundle;
  hasAyahs: boolean;
  surahAudioMode: boolean;
  reciterId: number;
  /** The current verse's per-verse audio, used when surah-audio mode is off. */
  effectiveAudioUrl: string;
}

interface UseSurahAudioResult {
  verseTimings: VerseTiming[];
  loading: boolean;
}

/**
 * Shared loader for both reader surfaces (/reader and /quran): switches the
 * engine between the whole-surah MP3 (fetching its verse timings once per
 * surah/reciter) and the selected verse's clip, mirroring the cancelled-flag
 * cleanup that previously existed — duplicated and slightly divergent — inside
 * QuranReader and ReaderWorkspace.
 */
export function useSurahAudio({
  engine,
  surah,
  hasAyahs,
  surahAudioMode,
  reciterId,
  effectiveAudioUrl,
}: UseSurahAudioOptions): UseSurahAudioResult {
  const [verseTimings, setVerseTimings] = useState<VerseTiming[]>([]);
  const [loading, setLoading] = useState(false);

  // Surah mode: fetch timings per surah/reciter and load the surah MP3.
  // fetchVerseTimings hits a third-party host, so it rejects when the user is
  // offline; without a catch that becomes an unhandled rejection. The
  // cancelled flag also stops a slow response for a previous surah/reciter
  // from landing after the selection has moved on.
  useEffect(() => {
    if (!surahAudioMode || !hasAyahs) return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag flips when the deferred timings fetch starts.
    setLoading(true);
    let cancelled = false;
    void fetchVerseTimings(surah.id, reciterId, surah.ayah_count)
      .then((timings) => {
        if (!cancelled) setVerseTimings(timings);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    engine.load(getSurahAudioUrl(surah.id, reciterId));
    return () => {
      cancelled = true;
    };
  }, [engine, surahAudioMode, hasAyahs, surah.id, surah.ayah_count, reciterId]);

  // Verse mode: the selection moved, so load that verse's clip.
  useEffect(() => {
    if (surahAudioMode || !hasAyahs) return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerseTimings([]);
    setLoading(false);
    engine.load(effectiveAudioUrl);
    return undefined;
  }, [engine, effectiveAudioUrl, surahAudioMode, hasAyahs]);

  return { verseTimings, loading };
}
