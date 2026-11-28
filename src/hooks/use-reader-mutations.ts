"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Ayah, Grade, MemoryState, SchedulerKind, SurahBundle } from "@/types/quran";
import type { SurahProgress, SurahVerseState } from "@/types/srs";
import { describeOutcome } from "@/lib/srs/sm2";
import { scheduleReview } from "@/lib/srs";
import { offlineReviewQueue, registerBackgroundSync } from "@/lib/offline/review-queue";

interface MemorySnapshot {
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapses: number;
  difficulty: number;
  stability: number;
}

const EMPTY_SNAPSHOT: MemorySnapshot = {
  state: "SABAQ",
  intervalDays: 0,
  easeFactor: 2.5,
  repetitionCount: 0,
  lapses: 0,
  difficulty: 0,
  stability: 0,
};

interface ServerReviewResult {
  verseKey: string;
  scheduler: SchedulerKind;
  state: MemoryState;
  intervalDays: number;
  easeFactor: number;
  difficulty?: number;
  stability?: number;
  repetitionCount: number;
}

function toSnapshot(r: ServerReviewResult): MemorySnapshot {
  return {
    state: r.state,
    intervalDays: r.intervalDays,
    easeFactor: r.easeFactor,
    repetitionCount: r.repetitionCount,
    lapses: EMPTY_SNAPSHOT.lapses,
    difficulty: r.difficulty ?? 0,
    stability: r.stability ?? 0,
  };
}

function previewSchedule(
  scheduler: SchedulerKind,
  snap: MemorySnapshot,
  grade: Grade,
  requestRetention: number
): MemorySnapshot {
  const out = scheduleReview(
    scheduler,
    {
      state: snap.state,
      intervalDays: snap.intervalDays,
      easeFactor: snap.easeFactor,
      repetitionCount: snap.repetitionCount,
      lapses: snap.lapses,
      difficulty: snap.difficulty,
      stability: snap.stability,
    },
    grade,
    { requestRetention }
  );
  return {
    state: out.state,
    intervalDays: out.intervalDays,
    easeFactor: out.easeFactor,
    repetitionCount: out.repetitionCount,
    lapses: out.lapses,
    difficulty: out.difficulty ?? snap.difficulty,
    stability: out.stability ?? snap.stability,
  };
}

interface UseReaderMutationsOptions {
  surah: SurahBundle;
  selected: Ayah | null;
  scheduler: SchedulerKind;
  requestRetention: number;
  progress: SurahProgress | null;
  initialVerseStates?: Record<string, SurahVerseState>;
  isGuest?: boolean;
  flashFor: (message: string) => void;
  advanceToNext: () => void;
  refreshProgress: () => void;
}

export function useReaderMutations({
  surah,
  selected,
  scheduler,
  requestRetention,
  progress,
  initialVerseStates,
  isGuest,
  flashFor,
  advanceToNext,
  refreshProgress,
}: UseReaderMutationsOptions) {
  const memoryStatesRef = useRef(
    new Map<string, MemorySnapshot>(
      Object.entries(initialVerseStates ?? {}).map(([k, v]) => [
        k,
        {
          state: v.state,
          intervalDays: v.intervalDays,
          easeFactor: v.easeFactor,
          repetitionCount: v.repetitionCount,
          lapses: v.lapses,
          difficulty: v.difficulty ?? 0,
          stability: v.stability ?? 0,
        },
      ])
    )
  );

  // Optimistic per-verse overrides layered on top of server `initialVerseStates`
  // — avoids syncing props into state via useEffect.
  const [stateOverrides, setStateOverrides] = useState<
    Record<string, MemoryState | undefined>
  >({});

  const verseStateMap = useMemo(() => {
    const out: Record<string, MemoryState> = {};
    for (const [k, v] of Object.entries(initialVerseStates ?? {})) {
      out[k] = v.state;
    }
    for (const [k, v] of Object.entries(stateOverrides)) {
      if (v === undefined) delete out[k];
      else out[k] = v;
    }
    return out;
  }, [initialVerseStates, stateOverrides]);

  const [markingSurah, setMarkingSurah] = useState(false);
  const [surahKnownOptimistic, setSurahKnownOptimistic] = useState(false);
  const [sessionGraded, setSessionGraded] = useState<Set<string>>(() => new Set());
  const selectedAtRef = useRef<number>(0);
  const selectedKey = selected?.verse_key ?? null;
  useEffect(() => {
    selectedAtRef.current = Date.now();
  }, [selectedKey]);

  const isSurahFullyKnown =
    (!!progress && progress.total > 0 && progress.known === progress.total) ||
    surahKnownOptimistic;

  const handleKnownSurah = useCallback(() => {
    if (isGuest) {
      flashFor("Sign in to mark surah as known");
      return;
    }
    if (isSurahFullyKnown) {
      flashFor(`All verses in Surah ${surah.name_simple} are already marked known`);
      return;
    }
    setMarkingSurah(true);
    setSurahKnownOptimistic(true);
    const prevSnapshots = new Map<string, MemorySnapshot | undefined>();
    for (const ayah of surah.ayahs) {
      prevSnapshots.set(ayah.verse_key, memoryStatesRef.current.get(ayah.verse_key));
      memoryStatesRef.current.set(ayah.verse_key, {
        ...EMPTY_SNAPSHOT,
        state: "KNOWN",
        repetitionCount: 1,
      });
    }
    setStateOverrides((m) => {
      const next = { ...m };
      for (const ayah of surah.ayahs) next[ayah.verse_key] = "KNOWN";
      return next;
    });
    flashFor(`Known ✓ Marked all ${surah.ayah_count} verses of Surah ${surah.name_simple} as known`);

    const rollback = () => {
      setSurahKnownOptimistic(false);
      for (const [key, prev] of prevSnapshots) {
        if (prev === undefined) memoryStatesRef.current.delete(key);
        else memoryStatesRef.current.set(key, prev);
      }
      setStateOverrides((m) => {
        const next = { ...m };
        for (const [key, prev] of prevSnapshots) {
          next[key] = prev?.state;
        }
        return next;
      });
    };

    fetch("/api/memory-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surahId: surah.id,
        fromAyah: 1,
        toAyah: surah.ayah_count,
        known: true,
      }),
    })
      .then((res) => {
        if (res.ok) {
          refreshProgress();
        } else {
          rollback();
          flashFor(`Could not mark Surah ${surah.name_simple} known — try again`);
        }
      })
      .catch(() => {
        rollback();
        flashFor(`Could not reach the server — Surah ${surah.name_simple} not saved`);
      })
      .finally(() => {
        setMarkingSurah(false);
      });
  }, [isGuest, isSurahFullyKnown, surah, flashFor, refreshProgress]);

  const handleKnown = useCallback(() => {
    if (!selected) return;
    if (isGuest) {
      flashFor("Sign in to mark verses as known");
      return;
    }
    const verseKey = selected.verse_key;
    const prev = memoryStatesRef.current.get(verseKey);
    if (prev?.state === "KNOWN") {
      flashFor(`${verseKey} is already marked known`);
      return;
    }
    memoryStatesRef.current.set(verseKey, {
      ...EMPTY_SNAPSHOT,
      state: "KNOWN",
      repetitionCount: 1,
    });
    setStateOverrides((m) => ({ ...m, [verseKey]: "KNOWN" }));
    flashFor(`Known ✓ ${verseKey} — skipped from the hifz process`);
    advanceToNext();

    const rollback = () => {
      if (prev === undefined) memoryStatesRef.current.delete(verseKey);
      else memoryStatesRef.current.set(verseKey, prev);
      setStateOverrides((m) => ({ ...m, [verseKey]: prev?.state }));
    };

    fetch("/api/memory-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKeys: [verseKey], known: true }),
    })
      .then(async (res) => {
        if (!res.ok) {
          rollback();
          flashFor(`Could not mark ${verseKey} known — try again`);
          return;
        }
        const data = (await res.json()) as {
          created?: number;
          changed?: number;
          alreadyKnown?: number;
          invalid?: number;
        };
        if (
          (data.invalid ?? 0) > 0 &&
          (data.created ?? 0) === 0 &&
          (data.changed ?? 0) === 0 &&
          (data.alreadyKnown ?? 0) === 0
        ) {
          rollback();
          flashFor(`Could not save ${verseKey} — verse not synced yet`);
          return;
        }
        refreshProgress();
      })
      .catch(() => {
        rollback();
        flashFor(`Could not reach the server — ${verseKey} not saved`);
      });
  }, [selected, isGuest, advanceToNext, flashFor, refreshProgress]);

  const handleGrade = useCallback(
    (grade: Grade) => {
      if (!selected) return;
      const verseKey = selected.verse_key;
      setSessionGraded((prev) => {
        const next = new Set(prev);
        next.add(verseKey);
        return next;
      });
      const prev = memoryStatesRef.current.get(verseKey) ?? EMPTY_SNAPSHOT;
      const outcome = previewSchedule(scheduler, prev, grade, requestRetention);
      memoryStatesRef.current.set(verseKey, outcome);
      flashFor(describeOutcome(outcome, grade));

      const queueLocally = (reason: string) => {
        offlineReviewQueue
          .enqueue({ verseKey, grade, timestamp: Date.now() })
          .then((id) => {
            flashFor(`${reason} — review queued (${id.slice(0, 8)})`);
            registerBackgroundSync().catch(() => {});
          })
          .catch(() => {
            flashFor("Saved locally only — could not reach the queue");
          });
      };

      if (isGuest) {
        queueLocally("Guest");
      } else if (!navigator.onLine) {
        queueLocally("Offline");
      } else {
        const durationMs =
          selectedAtRef.current > 0
            ? Math.min(Math.max(0, Date.now() - selectedAtRef.current), 600_000)
            : 0;
        fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseKey, grade, durationMs }),
        })
          .then(async (res) => {
            if (res.status === 401) {
              queueLocally("Session expired");
              return;
            }
            if (!res.ok) {
              queueLocally("Server error");
              return;
            }
            const data = (await res.json()) as { result: ServerReviewResult };
            const next = toSnapshot(data.result);
            next.lapses =
              grade === "AGAIN" && prev.state !== "SABAQ" ? prev.lapses + 1 : prev.lapses;
            memoryStatesRef.current.set(verseKey, next);
            setStateOverrides((m) => ({ ...m, [verseKey]: next.state }));
            if (prev.state === "KNOWN") {
              flashFor(
                grade === "AGAIN"
                  ? `Needs refresh — ${verseKey} moved to Sabqi`
                  : `Revised ✓ ${verseKey} — next check-in in ${Math.max(1, Math.round(next.intervalDays))}d`
              );
            } else {
              flashFor(describeOutcome(next, grade));
            }
            refreshProgress();
          })
          .catch(() => {
            queueLocally("Connection lost");
          });
      }

      advanceToNext();
    },
    [selected, scheduler, requestRetention, isGuest, advanceToNext, flashFor, refreshProgress]
  );

  return {
    verseStateMap,
    markingSurah,
    isSurahFullyKnown,
    sessionGraded,
    handleGrade,
    handleKnown,
    handleKnownSurah,
  };
}
