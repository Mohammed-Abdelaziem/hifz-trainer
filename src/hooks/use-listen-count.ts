"use client";

import { useEffect, useState } from "react";

/**
 * How many times this ayah has been listened to, across all sessions
 * (server-side readCount from /api/reading). One small request per
 * selection change. The count is null while loading, on failure, offline,
 * or signed out — and the entry is keyed by verse, so crossing to another
 * ayah internally still derives null without a synchronous reset.
 */
export function useListenCount(verseKey: string | null | undefined, enabled: boolean): number | null {
  const [entry, setEntry] = useState<{ key: string; count: number | null }>({ key: "", count: null });

  useEffect(() => {
    if (!enabled || !verseKey) return undefined;
    if (typeof navigator !== "undefined" && !navigator.onLine) return undefined;
    let cancelled = false;
    void fetch(`/api/reading?verseKey=${encodeURIComponent(verseKey)}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { readCount?: unknown };
      })
      .then((data) => {
        if (cancelled || !data) return;
        const n = data.readCount;
        if (typeof n === "number" && Number.isInteger(n) && n >= 0) {
          setEntry({ key: verseKey, count: n });
        }
      })
      .catch(() => {
        // Nudge data is best-effort; absence just means no nudge.
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, verseKey]);

  return entry.key === (verseKey ?? "") ? entry.count : null;
}
