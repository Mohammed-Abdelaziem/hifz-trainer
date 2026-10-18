"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { AudioEngine } from "@/lib/audio/engine";
import { useReaderStore } from "@/stores/reader-store";

export interface PlaybackSnapshot {
  positionMs: number;
  activeIndex: number;
  playing: boolean;
  durationMs: number | null;
}

const INITIAL_SNAPSHOT: PlaybackSnapshot = { positionMs: 0, activeIndex: -1, playing: false, durationMs: null };

interface SyncStore {
  snapshot: PlaybackSnapshot;
  listeners: Set<() => void>;
}

interface SyncContextValue {
  engine: AudioEngine;
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => PlaybackSnapshot;
}

const AudioSyncContext = createContext<SyncContextValue | null>(null);

/**
 * Tracks playback while highlighting and advancing verses only.
 *
 * Word-level karaoke highlighting was removed from this path: the per-word
 * timings returned by the recitation API drifted from real audio, so the
 * highlight jumped across words and missed the voice it was supposed to
 * follow. During playback the current verse still follows the reciter (the
 * engine's verse-crossing callback drives selection below), but words inside
 * a verse stay neutral. The only word highlight remaining is the explicit
 * word drill (forcedActiveIndex), which plays real per-word audio clips.
 */
export function AudioSyncProvider({ engine, children }: { engine: AudioEngine; children: React.ReactNode }) {
  const [store] = useState<SyncStore>(() => ({
    snapshot: INITIAL_SNAPSHOT,
    listeners: new Set(),
  }));

  const value = useMemo<SyncContextValue>(
    () => ({
      engine,
      subscribe: (cb) => {
        store.listeners.add(cb);
        return () => {
          store.listeners.delete(cb);
        };
      },
      getSnapshot: () => store.snapshot,
    }),
    [engine, store]
  );

  useEffect(() => {
    const tick = () => {
      const { forcedActiveIndex, loopA, loopB, surahAudioMode } = useReaderStore.getState();
      const playing = engine.isPlaying();

      if (forcedActiveIndex !== null) {
        if (
          forcedActiveIndex !== store.snapshot.activeIndex ||
          playing !== store.snapshot.playing
        ) {
          store.snapshot = {
            positionMs: store.snapshot.positionMs,
            activeIndex: forcedActiveIndex,
            playing,
            durationMs: store.snapshot.durationMs,
          };
          store.listeners.forEach((l) => l());
        }
        return;
      }

      const pos = engine.nowMs();
      const dur = engine.durationMs();

      if (playing && surahAudioMode) {
        // Howler's html5 audio emits no timeupdate, so the engine's
        // "play"/seek hookups never fire during smooth playback. This tick is
        // what makes the selection (and the verse highlight) follow the
        // reciter across verse boundaries. Paused seeks are skipped so the
        // user's manual selection is not yanked out from under them.
        engine.checkVerseChange();
      }

      // Both bounds are required. With only B set, seeking to `loopA ?? 0`
      // replayed 0→B forever and the early return froze the position readout.
      if (loopA !== null && loopB !== null && pos >= loopB) {
        engine.seekMs(loopA);
        return;
      }
      if (
        pos === store.snapshot.positionMs &&
        store.snapshot.activeIndex === -1 &&
        playing === store.snapshot.playing &&
        dur === store.snapshot.durationMs
      ) {
        return;
      }
      store.snapshot = {
        positionMs: pos,
        activeIndex: -1,
        playing,
        durationMs: dur,
      };
      store.listeners.forEach((l) => l());
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [engine, store]);

  useEffect(() => () => engine.pause(), [engine]);

  return <AudioSyncContext.Provider value={value}>{children}</AudioSyncContext.Provider>;
}

export function useAudioSyncContext(): SyncContextValue {
  const ctx = useContext(AudioSyncContext);
  if (!ctx) throw new Error("useAudioSyncContext must be used within AudioSyncProvider");
  return ctx;
}

export function usePlayback<T>(selector: (s: PlaybackSnapshot) => T): T {
  const { subscribe, getSnapshot } = useAudioSyncContext();
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(INITIAL_SNAPSHOT)
  );
}
