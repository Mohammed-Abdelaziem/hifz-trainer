"use client";

import { useEffect } from "react";
import type { AudioEngine } from "@/lib/audio/engine";

interface UseMediaSessionOptions {
  engine: AudioEngine;
  /** Mirrored into playbackState so the OS shows the right play/pause icon. */
  playing: boolean;
  /** Surah display name — becomes the OS player's track title. */
  surahName: string;
  /** Currently selected/sung verse key ("2:255"), shown as the artist line. */
  verseKey: string | null;
}

/**
 * Lock-screen, notification-shade and earbud (AVRCP) controls via the Media
 * Session API. Every entry point is guarded: browsers without
 * navigator.mediaSession (older Safari, most desktop Firefox) simply no-op.
 *
 * Handlers are anchored to the ENGINE, not React state: stepVerse resolves
 * the audio's current verse at press time, so the callback snapping in a
 * stale verseKey after a reciter crossing cannot mis-step.
 */
export function useMediaSession({ engine, playing, surahName, verseKey }: UseMediaSessionOptions) {
  // Track metadata: what the lock screen shows while reciter audio plays.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (typeof MediaMetadata === "undefined") return;
    const ayahNum = verseKey ? Number(verseKey.split(":")[1] ?? 0) : 0;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: surahName,
      artist: ayahNum ? `Ayah ${ayahNum}` : "Quran",
      album: "Hifz Trainer",
    });
  }, [surahName, verseKey]);

  // Transport actions: registered once per engine (they close over nothing
  // user-visible), torn down so an unmounting reader cannot keep steering a
  // dead engine from the lock screen.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    // Browsers reject unknown/unsupported actions; one throwing must not
    // disable the others, so each registration is guarded individually.
    const bind = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Action unsupported on this browser — skip it.
      }
    };
    bind("play", () => engine.play());
    bind("pause", () => engine.pause());
    bind("stop", () => engine.stop());
    bind("previoustrack", () => {
      engine.stepVerse(-1);
    });
    bind("nexttrack", () => {
      engine.stepVerse(1);
    });
    return () => {
      bind("play", null);
      bind("pause", null);
      bind("stop", null);
      bind("previoustrack", null);
      bind("nexttrack", null);
    };
  }, [engine]);

  // Playback state mirror (Chrome uses it to render the media notification).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);
}
