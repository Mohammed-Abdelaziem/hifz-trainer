"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Ayah,
  Grade,
  MemoryState,
  SchedulerKind,
  SurahBundle,
} from "@/types/quran";
import type { SurahProgress } from "@/lib/server/hifz-service";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { usePassiveReadingTracker } from "@/hooks/use-passive-reading-tracker";
import { useListenCount } from "@/hooks/use-listen-count";
import { useAudioEngine, useVerseData, useAudioSettings, useSurahAudio } from "@/hooks/audio";
import {
  schedule,
  describeOutcome,
} from "@/lib/srs/sm2";
import { scheduleFsrs } from "@/lib/srs/fsrs";
import { applyHifzRouting } from "@/lib/srs/routing";
import { GRADE_FLASH_MS, SYNC_STATUS_RESET_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useReaderStore } from "@/stores/reader-store";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { RatingBar } from "./RatingBar";
import { AudioControlBar } from "./AudioControlBar";
import { MediaSessionBridge } from "./MediaSessionBridge";
import { MaskingToolbar } from "./MaskingToolbar";
import { TafsirDrawer } from "./TafsirDrawer";
import { HelpSheet } from "./HelpSheet";
import { VerseCanvas } from "./VerseCanvas";
import { BulkActionBar } from "./BulkActionBar";
import { GradeNudge } from "./GradeNudge";
import { QuizModal } from "./QuizModal";
import { LiveWordsContext } from "./live-words-context";
import { offlineReviewQueue } from "@/lib/offline/review-queue";
import { registerBackgroundSync } from "@/lib/offline/review-queue";

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
  if (scheduler === "fsrs") {
    const out = scheduleFsrs(
      {
        difficulty: snap.difficulty,
        stability: snap.stability,
        repetitionCount: snap.repetitionCount,
        lapses: snap.lapses,
      },
      grade,
      new Date(),
      requestRetention
    );
    return {
      ...snap,
      intervalDays: out.intervalDays,
      difficulty: out.difficulty,
      stability: out.stability,
      repetitionCount: snap.repetitionCount + 1,
      state: applyHifzRouting(snap.state, grade, out.intervalDays),
    };
  }
  const out = schedule(
    {
      easeFactor: snap.easeFactor,
      intervalDays: snap.intervalDays,
      repetitionCount: snap.repetitionCount,
      state: snap.state,
    },
    grade
  );
  return {
    ...snap,
    intervalDays: out.intervalDays,
    easeFactor: out.easeFactor,
    repetitionCount: out.repetitionCount,
    state: out.state,
  };
}

export function ReaderWorkspace({
  surah,
  initialVerseKey,
  scheduler,
  requestRetention,
  availableSurahs,
  progress,
  isGuest,
}: {
  surah: SurahBundle;
  initialVerseKey?: string;
  scheduler: SchedulerKind;
  requestRetention: number;
  availableSurahs: { id: number; name_simple: string }[];
  progress: SurahProgress | null;
  isGuest?: boolean;
}) {
  const router = useRouter();
  const hasAyahs = surah.ayahs.length > 0;
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoryStatesRef = useRef(new Map<string, MemorySnapshot>());
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "completed" | "failed">("idle");
  const swTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const setHelpOpen = useReaderStore((s) => s.setHelpOpen);
  const [markingSurah, setMarkingSurah] = useState(false);
  // Optimistic companion to the server progress flag below: flips the
  // "Surah known ✓" chip the moment the user clicks, before refresh() lands.
  const [surahKnownOptimistic, setSurahKnownOptimistic] = useState(false);

  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);
  const surahAudioMode = useReaderStore((s) => s.surahAudioMode);
  const reciterId = useReaderStore((s) => s.reciterId);
  const bulkMode = useReaderStore((s) => s.bulkMode);
  const setBulkMode = useReaderStore((s) => s.setBulkMode);
  const bulkSelected = useReaderStore((s) => s.bulkSelected);
  const clearBulkSelection = useReaderStore((s) => s.clearBulkSelection);
  const layoutMode = useReaderStore((s) => s.layoutMode);

  // Non-null while the fill-in-the-blank quiz over the bulk selection is open.
  const [quizAyahs, setQuizAyahs] = useState<Ayah[] | null>(null);
  // Verses graded in this session keep the listen nudge quiet — the count
  // from the server stays high even after a fresh grade.
  const [sessionGraded, setSessionGraded] = useState<Set<string>>(() => new Set());

  // Bulk selection is a Flow-layout affordance: Mushaf renders verses as
  // inline words inside one paragraph, where per-verse checkboxes have no
  // sensible anchor. Auto-exit if the layout flips while selecting.
  useEffect(() => {
    if (bulkMode && layoutMode === "MUSHAF") setBulkMode(false);
  }, [bulkMode, layoutMode, setBulkMode]);

  const [jumpInput, setJumpInput] = useState("");

  const { selected, live, effectiveSelected } = useVerseData(surah, hasAyahs);
  const onVerseChange = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const surahUrl = useCallback((id: number) => `/reader/${id}`, []);
  const engine = useAudioEngine({
    surah,
    selected,
    hasAyahs,
    onVerseChange,
    availableSurahs,
    surahUrl,
  });
  useAudioSettings(engine);

  useEffect(() => {
    if (!hasAyahs) return;
    const requested =
      initialVerseKey && surah.ayahs.some((a) => a.verse_key === initialVerseKey)
        ? initialVerseKey
        : null;
    const target = requested ?? surah.ayahs[0].verse_key;
    selectAyah(target);
    resetRevealed(target);
  }, [hasAyahs, selectAyah, resetRevealed, surah, initialVerseKey]);

  usePassiveReadingTracker(selected?.verse_key, !isGuest && hasAyahs);

  // Grade-ready nudge: after enough accumulated listens of the selected
  // ayah (across sessions, per the passive tracker's readCount), invite the
  // user to convert listening into SRS data.
  const listenCount = useListenCount(selected?.verse_key ?? null, !isGuest && hasAyahs);

  useSurahAudio({
    engine,
    surah,
    hasAyahs,
    surahAudioMode,
    reciterId,
    effectiveAudioUrl: effectiveSelected.audio_url,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const handleSWMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === "SYNC_STARTED") {
        setSyncStatus("syncing");
      } else if (data.type === "SYNC_COMPLETED") {
        setSyncStatus("completed");
        const t = setTimeout(() => setSyncStatus("idle"), SYNC_STATUS_RESET_MS);
        swTimeoutsRef.current.push(t);
      } else if (data.type === "SYNC_FAILED") {
        setSyncStatus("failed");
        const t = setTimeout(() => setSyncStatus("idle"), 3000);
        swTimeoutsRef.current.push(t);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      swTimeoutsRef.current.forEach(clearTimeout);
      swTimeoutsRef.current = [];
    };
  }, []);

  const flashFor = useCallback((message: string) => {
    setFlash(message);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), GRADE_FLASH_MS);
  }, []);

  const jumpToAyah = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return;
      let m = /^(\d+)$/.exec(value);
      if (m) {
        const n = Number(m[1]);
        if (n < 1 || n > surah.ayah_count) {
          flashFor(`${surah.name_simple} has ${surah.ayah_count} verses`);
          return;
        }
        selectAyah(`${surah.id}:${n}`);
        resetRevealed(`${surah.id}:${n}`);
        setJumpInput("");
        return;
      }
      m = /^(\d+):(\d+)$/.exec(value);
      if (m) {
        const s = Number(m[1]);
        const n = Number(m[2]);
        if (s === surah.id) {
          if (n < 1 || n > surah.ayah_count) {
            flashFor(`${surah.name_simple} has ${surah.ayah_count} verses`);
            return;
          }
          selectAyah(`${s}:${n}`);
          resetRevealed(`${s}:${n}`);
          setJumpInput("");
        } else {
          router.push(`/reader/${s}?verse=${s}:${n}`);
        }
        return;
      }
      flashFor("Enter an ayah number (e.g. 7) or surah:ayah (e.g. 2:255)");
    },
    [surah.id, surah.name_simple, surah.ayah_count, selectAyah, resetRevealed, router, flashFor]
  );

  // The fixed bottom sheet (bulk bar + audio card + rating bar + the mobile
  // nav reserve) is as tall as its content: the height changes with viewport
  // width and whatever appears or expands inside. Hardcoded offsets under the
  // floating tafsir and "?" buttons and the flash toast landed ON the volume
  // slider and audio card on phones, so publish the measured height as a CSS
  // custom property and let each floating element ride above the sheet's
  // live size (the fallbacks in the calc()s reproduce the old fixed offsets,
  // so server-rendered HTML paints identically before hydration).
  useEffect(() => {
    const sheet = document.getElementById("reader-bottom-sheet");
    if (!sheet) return;
    const apply = () => {
      const h = Math.round(sheet.getBoundingClientRect().height);
      if (h > 0) {
        document.documentElement.style.setProperty("--bottom-sheet-h", `${h}px`);
      }
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(sheet);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--bottom-sheet-h");
    };
  }, []);

  // Shared "move on to the next verse (or surah)" logic for grading and for
  // the known-marking flow, so both behaviors always stay in step.
  const advanceToNext = useCallback(() => {
    if (!selected) return;
    const idx = surah.ayahs.findIndex((a) => a.verse_key === selected.verse_key);
    if (idx + 1 < surah.ayahs.length) {
      const nextAyah = surah.ayahs[idx + 1];
      selectAyah(nextAyah.verse_key);
      resetRevealed(nextAyah.verse_key);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-verse="${nextAyah.verse_key}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    } else {
      const surahIdx = availableSurahs.findIndex((s) => s.id === surah.id);
      const nextSurah =
        surahIdx >= 0 && surahIdx < availableSurahs.length - 1
          ? availableSurahs[surahIdx + 1]
          : null;
      if (nextSurah) {
        router.push(`/reader/${nextSurah.id}`);
      }
    }
  }, [selected, surah.ayahs, surah.id, selectAyah, resetRevealed, availableSurahs, router]);

  // Survives reloads because it reads the server's persisted progress — the
  // previous session-only ref map cleared the chip on every page load. The
  // optimistic flag covers the click-to-refresh window and resets with the
  // keyed remount on surah change.
  const isSurahFullyKnown =
    (!!progress && progress.total > 0 && progress.known === progress.total) ||
    surahKnownOptimistic;

  /**
   * Marks the entire current surah as already memorized.
   */
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
    for (const ayah of surah.ayahs) {
      memoryStatesRef.current.set(ayah.verse_key, {
        ...EMPTY_SNAPSHOT,
        state: "KNOWN",
        repetitionCount: 1,
      });
    }
    flashFor(`Known ✓ Marked all ${surah.ayah_count} verses of Surah ${surah.name_simple} as known`);

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
          router.refresh();
        } else {
          flashFor(`Could not mark Surah ${surah.name_simple} known — try again`);
        }
      })
      .catch(() => {
        flashFor(`Could not reach the server — Surah ${surah.name_simple} not saved`);
      })
      .finally(() => {
        setMarkingSurah(false);
      });
  }, [isGuest, isSurahFullyKnown, surah, flashFor, router]);

  /**
   * Marks the selected verse as already memorized and skips it with no SRS
   * churn — the audit's "I already know this part" flow.
   */
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
    flashFor(`Known ✓ ${verseKey} — skipped from the hifz process`);
    advanceToNext();

    fetch("/api/memory-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseKeys: [verseKey], known: true }),
    }).then((res) => {
      // The optimistic advance already happened; just surface failures with
      // the verse key so the user knows what to retry.
      if (!res.ok) flashFor(`Could not mark ${verseKey} known — try again`);
    }).catch(() => {
      flashFor(`Could not reach the server — ${verseKey} not saved`);
    });
  }, [selected, isGuest, advanceToNext, flashFor]);

  const handleGrade = useCallback((grade: Grade) => {
    if (!selected) return;
    const verseKey = selected.verse_key;
    // A verse graded this session keeps the listen nudge quiet even though
    // its server-side listen count is still above the threshold.
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
          // The IndexedDB write itself failed; the local SRS preview above
          // still stands, so say so rather than claiming it was saved.
          flashFor("Saved locally only — could not reach the queue");
        });
    };

    if (isGuest) {
      queueLocally("Guest");
    } else if (!navigator.onLine) {
      queueLocally("Offline");
    } else {
      fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey, grade }),
      })
        .then(async (res) => {
          if (res.status === 401) {
            queueLocally("Session expired");
            return;
          }
          // A 500, a rate limit, or an expired session all used to return
          // early, silently discarding a grade the user had just seen succeed.
          if (!res.ok) {
            queueLocally("Server error");
            return;
          }
          const data = (await res.json()) as { result: ServerReviewResult };
          const next = toSnapshot(data.result);
          next.lapses =
            grade === "AGAIN" && prev.state !== "SABAQ" ? prev.lapses + 1 : prev.lapses;
          memoryStatesRef.current.set(verseKey, next);
          flashFor(describeOutcome(next, grade));
        })
        .catch(() => {
          // Offline mid-request, a dropped connection, or a backgrounded tab.
          queueLocally("Connection lost");
        });
    }

    // Deliberately not an early return: where the grade is persisted must not
    // change whether the reader advances to the next verse.
    advanceToNext();
  }, [selected, scheduler, requestRetention, isGuest, advanceToNext, flashFor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      // Grading must not fire for keys pressed while an overlay or select dropdown has focus
      if (target.closest("select, [role='combobox'], [role='listbox'], [role='slider'], [role='dialog']")) {
        return;
      }
      const store = useReaderStore.getState();
      if (store.tafsirOpen || store.helpOpen) return;
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(!store.helpOpen);
        return;
      }
      // While selecting verses, digits are worksheets not grades: a stray
      // "3" during selection must not grade the still-selected verse.
      if (store.bulkMode) return;
      if (e.shiftKey && (e.key === "5" || e.key === "%")) {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleKnownSurah();
        return;
      }
      if (e.key === "5") {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleKnown();
        return;
      }
      const map: Record<string, Grade> = { "1": "AGAIN", "2": "HARD", "3": "GOOD", "4": "EASY" };
      const grade = map[e.key];
      if (grade) {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleGrade(grade);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleGrade, handleKnown, handleKnownSurah, setHelpOpen]);

  const refreshProgress = useCallback(() => {
    router.refresh();
  }, [router]);

  if (!hasAyahs) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-48 pt-6">
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No verse data available for this surah. Please try another.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AudioSyncProvider engine={engine}>
      <MediaSessionBridge surahName={surah.name_simple} verseKey={selected?.verse_key ?? null} />
      <LiveWordsContext.Provider
        value={live ? { verseKey: selected!.verse_key, words: live.words } : null}
      >
        <div className="mx-auto max-w-4xl px-4 pb-[calc(var(--bottom-sheet-h,4rem)+8rem)] pt-6">
          <header className="mb-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 sm:items-center">
              <div>
                <Link
                  href="/"
                  className="mb-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  <ArrowLeft className="h-3 w-3" /> Dashboard
                </Link>
                <h1 className="flex items-baseline gap-3">
                  <span dir="rtl" lang="ar" className="font-quran text-4xl">
                    {surah.name_arabic}
                  </span>
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                  <span className="whitespace-nowrap">
                    {surah.name_simple} ·{" "}
                    {surah.revelation_place === "makkah" ? "Makkan" : "Madinan"} ·{" "}
                    {surah.ayah_count} verses
                  </span>
                  {progress && progress.total > 0 ? (
                    (() => {
                      const learning =
                        progress.sabaq + progress.sabqi + progress.manzil;
                      const fullyKnown = progress.known === progress.total;
                      return (
                        // Real per-surah progress: replaced the fake "Sabqi"
                        // badge that decorated every surah regardless of
                        // history, and makes "already known" parts visible.
                        <Badge
                          variant={fullyKnown ? "success" : learning > 0 ? "warning" : "secondary"}
                          className="gap-1"
                          title={`${progress.known} known · ${progress.sabaq} new · ${progress.sabqi} recent review · ${progress.manzil} long-term of ${progress.total} verses`}
                        >
                          <Star className="h-3 w-3" aria-hidden="true" />
                          {progress.known}/{progress.total} known
                          {learning > 0 ? ` · ${learning} in hifz` : ""}
                        </Badge>
                      );
                    })()
                  ) : progress ? (
                    <Badge variant="secondary">Not tracked yet</Badge>
                  ) : (
                    // Guest (no progress data): stay silent instead of a badge
                    // that claims a state nobody verified.
                    <Badge variant="secondary">Guest</Badge>
                  )}
                </p>
              </div>
              <nav className="flex shrink-0 items-center gap-1.5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    jumpToAyah(jumpInput);
                  }}
                  aria-label="Jump to ayah"
                >
                  <input
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Ayah…"
                    aria-label="Jump to ayah"
                    title="Jump to ayah: 7 or surah:ayah like 2:255"
                    className="w-28 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
                  />
                </form>
                {(() => {
                  const idx = availableSurahs.findIndex((s) => s.id === surah.id);
                  const prev = idx > 0 ? availableSurahs[idx - 1] : null;
                  const next =
                    idx >= 0 && idx < availableSurahs.length - 1
                      ? availableSurahs[idx + 1]
                      : null;
                  return (
                    <>
                      {prev && (
                        <Link
                          href={`/reader/${prev.id}`}
                          title={prev.name_simple}
                          className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                          ←
                        </Link>
                      )}
                      <Select
                        value={String(surah.id)}
                        onChange={(e) => {
                          router.push(`/reader/${e.target.value}`);
                        }}
                        aria-label="Switch surah"
                        className="w-36 sm:w-48 max-w-[200px]"
                        options={availableSurahs.map((s) => ({
                          value: String(s.id),
                          label: `${s.id}. ${s.name_simple}`,
                        }))}
                      />
                      {next && (
                        <Link
                          href={`/reader/${next.id}`}
                          title={next.name_simple}
                          className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                          →
                        </Link>
                      )}
                    </>
                  );
                })()}
              </nav>
            </div>
          </header>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <MaskingToolbar />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleKnownSurah}
                disabled={isSurahFullyKnown || markingSurah}
                title={`Mark all ${surah.ayah_count} verses of ${surah.name_simple} as already known (key: Shift + 5)`}
                aria-label={`Mark Surah ${surah.name_simple} as already known`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  isSurahFullyKnown
                    ? "border-teal-600 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                    : "border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-800 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                )}
              >
                <Star className={cn("h-3.5 w-3.5", isSurahFullyKnown && "fill-current text-teal-600 dark:text-teal-400")} />
                {isSurahFullyKnown ? "Surah known ✓" : "Mark surah as known"}
              </button>
              <button
                type="button"
                onClick={() => setBulkMode(!bulkMode)}
                aria-pressed={bulkMode}
                disabled={layoutMode === "MUSHAF"}
                title={
                  layoutMode === "MUSHAF"
                    ? "Switch to Flow layout to select verses"
                    : "Select multiple verses to mark known or add to Sabaq"
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  bulkMode
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                )}
              >
                <Check className="h-3.5 w-3.5" />
                {bulkMode ? "Selecting" : "Select verses"}
              </button>
            </div>
          </div>

          <main className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
            <VerseCanvas surah={surah} />
          </main>

          <p className="mt-3 text-center text-xs text-stone-400">
            Tap blurred / hidden words to reveal · click an ayah to make it the audio &amp; rating
            target · WbW mode drills each word with its own audio
          </p>

          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
                className="fixed bottom-[calc(var(--bottom-sheet-h,9rem)+1rem)] right-1/2 z-50 translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-xl dark:bg-amber-600"
              >
                {flash}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          id="reader-bottom-sheet"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95"
        >
          {/* MobileNav is also fixed to the bottom and sits at z-50, so on
              phones it covered the rating buttons and made them untappable.
              Reserve its height here and drop back to the normal padding from
              md up, where the nav is hidden. */}
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5 px-3 pb-16 pt-3 md:pb-3">
            {bulkMode && (
              <BulkActionBar
                allKeys={surah.ayahs.map((a) => a.verse_key)}
                isGuest={!!isGuest}
                onResult={flashFor}
                onProgressChange={refreshProgress}
                onQuiz={() => {
                  // One round per verse, in surah order; the selection is
                  // cleared — the quiz carries its own copy forward.
                  const picked = surah.ayahs
                    .filter((a) => bulkSelected.includes(a.verse_key))
                    .sort((a, b) => a.ayah_number - b.ayah_number);
                  clearBulkSelection();
                  setQuizAyahs(picked);
                }}
              />
            )}
            <AudioControlBar
              words={effectiveSelected.words}
              verseKey={selected!.verse_key}
              syncStatus={syncStatus}
            />
            <GradeNudge
              verseKey={selected!.verse_key}
              listenCount={listenCount}
              hidden={sessionGraded.has(selected!.verse_key)}
            />
            <RatingBar
              verseKey={selected!.verse_key}
              onGrade={handleGrade}
              onKnown={isGuest ? undefined : handleKnown}
              onKnownSurah={isGuest ? undefined : handleKnownSurah}
            />
          </div>
        </div>

        {quizAyahs && (
          <QuizModal
            ayahs={quizAyahs}
            surahName={surah.name_simple}
            isGuest={!!isGuest}
            onClose={() => setQuizAyahs(null)}
            onResult={flashFor}
            onProgressChange={refreshProgress}
          />
        )}

        <TafsirDrawer ayah={effectiveSelected} />
        <HelpSheet />
        {/* The keyboard-shortcuts affordance moved into the masking toolbar
            row next to A-/A+ — as a fixed FAB it rendered exactly on top of
            that row's right-aligned chips at narrow widths. */}
      </LiveWordsContext.Provider>
    </AudioSyncProvider>
  );
}
