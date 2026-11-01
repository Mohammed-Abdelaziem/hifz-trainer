"use client";

import { useAudioSyncContext, usePlayback } from "@/hooks/use-audio-sync";
import { useMediaSession } from "@/hooks/use-media-session";

interface MediaSessionBridgeProps {
  surahName: string;
  verseKey: string | null;
}

/**
 * Renders nothing. Mounted *inside* AudioSyncProvider so it can read play
 * state through the tick store (re-renders only on a play/pause flip, not
 * every 50ms) and hand it, with the engine, to useMediaSession.
 */
export function MediaSessionBridge({ surahName, verseKey }: MediaSessionBridgeProps) {
  const { engine } = useAudioSyncContext();
  const playing = usePlayback((p) => p.playing);
  useMediaSession({ engine, playing, surahName, verseKey });
  return null;
}
