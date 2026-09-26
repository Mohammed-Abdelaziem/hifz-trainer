"use client";

import { useEffect, useState } from "react";
import type { MergedSegment } from "@/lib/quran/timings";

/**
 * Fetches real per-word recitation timings for a whole surah in one request.
 *
 * quran.com only exposes segments through the `by_chapter` endpoint, so this is
 * fetched per surah/reciter rather than per verse. Results are cached in module
 * scope so moving between verses does not refetch.
 */
const cache = new Map<string, Record<string, MergedSegment[]>>();
const EMPTY: Record<string, MergedSegment[]> = {};

function cacheKey(surahId: number, reciterId: number): string {
  return `${surahId}:${reciterId}`;
}

export function useWordTimings(surahId: number, reciterId: number): Record<string, MergedSegment[]> {
  const key = cacheKey(surahId, reciterId);
  const [resolved, setResolved] = useState<{
    key: string;
    timings: Record<string, MergedSegment[]>;
  } | null>(null);

  useEffect(() => {
    if (cache.has(key)) return;

    let cancelled = false;
    fetch(`/api/word-timings?surah=${surahId}&reciter=${reciterId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { timings?: Record<string, MergedSegment[]> } | null) => {
        if (cancelled || !data?.timings) return;
        cache.set(key, data.timings);
        setResolved({ key, timings: data.timings });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [key, surahId, reciterId]);

  if (resolved?.key === key) return resolved.timings;
  return cache.get(key) ?? EMPTY;
}
