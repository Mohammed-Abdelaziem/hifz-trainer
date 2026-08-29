"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { AudioEngine } from "@/lib/audio/engine";
import type { WordTiming } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";

export interface PlaybackSnapshot {
  positionMs: number;
  activeIndex: number;
  playing: boolean;
}

const INITIAL_SNAPSHOT: PlaybackSnapshot = { positionMs: 0, activeIndex: -1, playing: false };

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

function indexForPosition(timings: WordTiming[], pos: number): number {
  for (let i = 0; i < timings.length; i++) {
    if (pos >= timings[i].start_ms && pos < timings[i].end_ms) return i;
    if (pos < timings[i].start_ms) break;
  }
  return -1;
}

export function AudioSyncProvider({
  engine,
  timings,
  children,
}: {
  engine: AudioEngine;
  timings: WordTiming[];
  children: React.ReactNode;
}) {
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
      const { forcedActiveIndex, loopA, loopB } = useReaderStore.getState();
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
          };
          store.listeners.forEach((l) => l());
        }
        return;
      }

      const pos = engine.nowMs();
      let idx = -1;
      if (timings.length > 0 && pos >= timings[0].start_ms) {
        idx = indexForPosition(timings, pos);
      }
      if (loopB !== null && pos >= loopB) {
        engine.seekMs(loopA ?? 0);
        return;
      }
      if (
        pos === store.snapshot.positionMs &&
        idx === store.snapshot.activeIndex &&
        playing === store.snapshot.playing
      ) {
        return;
      }
      store.snapshot = {
        positionMs: pos,
        activeIndex: idx,
        playing,
      };
      store.listeners.forEach((l) => l());
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [engine, timings, store]);

  useEffect(() => () => engine.pause(), [engine]);

  return <AudioSyncContext.Provider value={value}>{children}</AudioSyncContext.Provider>;
}

export function useAudioSyncContext(): SyncContextValue {
  const ctx = useContext(AudioSyncContext);
  if (!ctx) throw new Error("usePlayback must be used within AudioSyncProvider");
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
