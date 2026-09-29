import { useEffect, useRef } from "react";

const MIN_DWELL_MS = 800;
const MAX_DWELL_MS = 10 * 60 * 1000;

function sendReading(verseKey: string, durationMs: number) {
  if (durationMs < MIN_DWELL_MS) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  void fetch("/api/reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verseKey, durationMs }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Tracks which verse the user is actually reading or listening to and records
 * it once they have dwelled on it.
 *
 * The verse is flushed the moment the selection moves on, so verses are never
 * lost when playback advances faster than a single debounce window. The
 * recorded duration is the full dwell time, so a long listen is never
 * truncated by an intermediate flush.
 */
export function usePassiveReadingTracker(
  verseKey: string | null | undefined,
  enabled: boolean
) {
  const currentRef = useRef<string | null>(null);
  const enteredAtRef = useRef(0);

  useEffect(() => {
    if (!enabled || !verseKey) return;

    const flush = () => {
      const key = currentRef.current;
      const enteredAt = enteredAtRef.current;
      if (!key || !enteredAt) return;
      currentRef.current = null;
      enteredAtRef.current = 0;
      sendReading(key, Math.min(Date.now() - enteredAt, MAX_DWELL_MS));
    };

    // Runs on verse change, unmount, and tab close/navigation so a listen
    // session is recorded even if the user never clicks anything.
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);

    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [enabled, verseKey]);

  useEffect(() => {
    if (!enabled || !verseKey) return;
    if (currentRef.current === verseKey) return;
    currentRef.current = verseKey;
    enteredAtRef.current = Date.now();
  }, [enabled, verseKey]);
}
