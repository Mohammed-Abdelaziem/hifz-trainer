"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ayah, QuranWord, SurahBundle } from "@/types/quran";
import { synthTimings, toWordTimings, type MergedSegment } from "@/lib/quran/timings";
import { useReaderStore } from "@/stores/reader-store";

interface LiveState {
  key: string;
  words: QuranWord[];
  audioUrl: string | null;
  tafsir: string | null;
}

export function useVerseData(
  surah: SurahBundle,
  hasAyahs: boolean,
  timingsByVerse?: Record<string, MergedSegment[]>
) {
  const [liveState, setLiveState] = useState<LiveState | null>(null);

  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);
  const reciterId = useReaderStore((s) => s.reciterId);

  const selected: Ayah | null = hasAyahs
    ? (surah.ayahs.find((a) => a.verse_key === selectedVerseKey) ?? surah.ayahs[0])
    : null;

  useEffect(() => {
    if (!hasAyahs || !selected) return;
    let cancelled = false;
    fetch(
      `/api/ayah-data?verseKey=${encodeURIComponent(selected.verse_key)}&reciter=${reciterId}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: { words?: QuranWord[]; recitationUrl?: string | null; tafsir?: string | null } | null
        ) => {
          if (!cancelled && data?.words?.length) {
            setLiveState({
              key: `${selected.verse_key}:${reciterId}`,
              words: data.words,
              audioUrl: data.recitationUrl ?? null,
              tafsir: data.tafsir ?? null,
            });
          }
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasAyahs, selected, reciterId]);

  const live =
    liveState && selected && liveState.key === `${selected.verse_key}:${reciterId}`
      ? liveState
      : null;

  const effectiveSelected: Ayah = useMemo(() => {
    if (!selected)
      return { ayah_number: 0, verse_key: "1:1", words: [], audio_url: "", timings: [], tafsir: "" };
    if (!live) return selected;

    const merged = timingsByVerse?.[selected.verse_key];
    const real = merged ? toWordTimings(merged, live.words.length) : [];
    const timings = real.length > 0 ? real : synthTimings(live.words);

    return {
      ...selected,
      words: live.words,
      audio_url: live.audioUrl ?? selected.audio_url,
      timings,
      tafsir: selected.tafsir || live.tafsir || "",
    };
  }, [selected, live, timingsByVerse]);

  return { selected, live, effectiveSelected };
}
