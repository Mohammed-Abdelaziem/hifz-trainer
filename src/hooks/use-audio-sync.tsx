"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { AudioEngine } from "@/lib/audio/engine";
import type { VerseTiming } from "@/lib/audio/full-surah";
import type { WordTiming } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";

export interface PlaybackSnapshot {
  positionMs: number;
  activeIndex: number;
  playing: boolean;
  activeVerseKey: string | null;
  durationMs: number | null;
}

const INITIAL_SNAPSHOT: PlaybackSnapshot = { positionMs: 0, activeIndex: -1, playing: false, activeVerseKey: null, durationMs: null };

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

function verseKeyForPosition(verseTimings: VerseTiming[], pos: number): string | null {
  for (let i = 0; i < verseTimings.length; i++) {
    if (pos >= verseTimings[i].start_ms && pos < verseTimings[i].end_ms) {
      return verseTimings[i].verseKey;
    }
  }
  if (verseTimings.length > 0 && pos >= verseTimings[verseTimings.length - 1].start_ms) {
    return verseTimings[verseTimings.length - 1].verseKey;
  }
  return null;
}

function verseStartFor(verseTimings: VerseTiming[], verseKey: string): number | undefined {
  return verseTimings.find((t) => t.verseKey === verseKey)?.start_ms;
}

/**
 * Resolves which verse is playing and which word inside it, for continuous
 * full-surah playback.
 *
 * Two different coordinate spaces are involved: `pos` is an absolute position
 * in the whole-surah MP3, while `wordTimings` are relative to the start of a
 * single ayah. The verse offset has to be subtracted before they can be
 * compared — without that step no word is ever highlighted.
 *
 * `wordTimings` belongs to whichever verse the reader has selected, which lags
 * `pos` by a render when the audio crosses a boundary. So the index is reset to
 * -1 for the tick on which the verse changes rather than highlighting against
 * timings that still describe the previous verse.
 */
export function resolveSurahPlaybackPosition(args: {
  pos: number;
  verseTimings: VerseTiming[];
  wordTimings: WordTiming[];
  previousVerseKey: string | null;
}): { activeVerseKey: string | null; activeIndex: number } {
  const { pos, verseTimings, wordTimings, previousVerseKey } = args;
  const found = verseKeyForPosition(verseTimings, pos);
  const activeVerseKey = found ?? previousVerseKey;

  if (!activeVerseKey) return { activeVerseKey, activeIndex: -1 };
  if (found !== null && found !== previousVerseKey) {
    // Verse boundary crossed; word timings still describe the old verse.
    return { activeVerseKey, activeIndex: -1 };
  }

  const verseStart = verseStartFor(verseTimings, activeVerseKey);
  if (verseStart === undefined || wordTimings.length === 0) {
    return { activeVerseKey, activeIndex: -1 };
  }

  return { activeVerseKey, activeIndex: indexForPosition(wordTimings, pos - verseStart) };
}

export function AudioSyncProvider({
  engine,
  timings,
  verseTimings,
  children,
}: {
  engine: AudioEngine;
  timings: WordTiming[];
  verseTimings?: VerseTiming[];
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
            activeVerseKey: store.snapshot.activeVerseKey,
            durationMs: store.snapshot.durationMs,
          };
          store.listeners.forEach((l) => l());
        }
        return;
      }

      const pos = engine.nowMs();
      const dur = engine.durationMs();
      let idx = -1;
      let activeVerseKey = store.snapshot.activeVerseKey;

      if (surahAudioMode) {
        if (verseTimings && verseTimings.length > 0) {
          const resolved = resolveSurahPlaybackPosition({
            pos,
            verseTimings,
            wordTimings: timings,
            previousVerseKey: activeVerseKey,
          });
          activeVerseKey = resolved.activeVerseKey;
          idx = resolved.activeIndex;
        }
      } else if (timings.length > 0 && pos >= timings[0].start_ms) {
        idx = indexForPosition(timings, pos);
      }

      // Both bounds are required. With only B set, seeking to `loopA ?? 0`
      // replayed 0→B forever and the early return froze the position readout.
      if (loopA !== null && loopB !== null && pos >= loopB) {
        engine.seekMs(loopA);
        return;
      }
      if (
        pos === store.snapshot.positionMs &&
        idx === store.snapshot.activeIndex &&
        playing === store.snapshot.playing &&
        activeVerseKey === store.snapshot.activeVerseKey &&
        dur === store.snapshot.durationMs
      ) {
        return;
      }
      store.snapshot = {
        positionMs: pos,
        activeIndex: idx,
        playing,
        activeVerseKey,
        durationMs: dur,
      };
      store.listeners.forEach((l) => l());
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [engine, timings, verseTimings, store]);

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
