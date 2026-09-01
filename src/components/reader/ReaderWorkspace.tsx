"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Ayah,
  Grade,
  MemoryState,
  QuranWord,
  SchedulerKind,
  SurahBundle,
  WordTiming,
} from "@/types/quran";
import { AudioEngine } from "@/lib/audio/engine";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import {
  schedule,
  describeOutcome,
} from "@/lib/srs/sm2";
import { scheduleFsrs } from "@/lib/srs/fsrs";
import { applyHifzRouting } from "@/lib/srs/routing";
import { useReaderStore } from "@/stores/reader-store";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { RatingBar } from "./RatingBar";
import { AudioControlBar } from "./AudioControlBar";
import { MaskingToolbar } from "./MaskingToolbar";
import { TafsirDrawer } from "./TafsirDrawer";
import { HelpSheet } from "./HelpSheet";
import { VerseCanvas } from "./VerseCanvas";
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
  isGuest,
}: {
  surah: SurahBundle;
  initialVerseKey?: string;
  scheduler: SchedulerKind;
  requestRetention: number;
  availableSurahs: { id: number; name_simple: string }[];
  isGuest?: boolean;
}) {
  const engine = useMemo(() => new AudioEngine(), []);
  const router = useRouter();
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoryStatesRef = useRef(new Map<string, MemorySnapshot>());
  const [liveState, setLiveState] = useState<{
    key: string;
    words: QuranWord[];
    audioUrl: string | null;
    tafsir: string | null;
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "completed" | "failed">("idle");

  const handleSWMessage = (event: MessageEvent) => {
    const data = event.data;
    if (data.type === "SYNC_STARTED") {
      setSyncStatus("syncing");
    } else if (data.type === "SYNC_COMPLETED") {
      setSyncStatus("completed");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } else if (data.type === "SYNC_FAILED") {
      setSyncStatus("failed");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleSWMessage);
  }, []);

  const helpOpen = useReaderStore((s) => s.helpOpen);
  const setHelpOpen = useReaderStore((s) => s.setHelpOpen);

  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);
  const reciterId = useReaderStore((s) => s.reciterId);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);

  const hasAyahs = surah.ayahs.length > 0;

  const selected: Ayah | null = hasAyahs
    ? (surah.ayahs.find((a) => a.verse_key === selectedVerseKey) ?? surah.ayahs[0])
    : null;

  useEffect(() => {
    if (!hasAyahs) return;
    useReaderStore.persist.rehydrate();
    const requested =
      initialVerseKey && surah.ayahs.some((a) => a.verse_key === initialVerseKey)
        ? initialVerseKey
        : null;
    const target = requested ?? surah.ayahs[0].verse_key;
    selectAyah(target);
    resetRevealed(target);
  }, [hasAyahs, selectAyah, resetRevealed, surah, initialVerseKey]);

  useEffect(() => {
    if (!hasAyahs || !selected) return;
    let cancelled = false;
    fetch(
      `/api/ayah-data?verseKey=${encodeURIComponent(selected.verse_key)}&reciter=${reciterId}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { words?: QuranWord[]; recitationUrl?: string | null; tafsir?: string | null } | null) => {
        if (!cancelled && data?.words?.length) {
          setLiveState({
            key: `${selected.verse_key}:${reciterId}`,
            words: data.words,
            audioUrl: data.recitationUrl ?? null,
            tafsir: data.tafsir ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasAyahs, selected, reciterId]);

  const live =
    liveState && selected && liveState.key === `${selected.verse_key}:${reciterId}` ? liveState : null;

  const effectiveSelected: Ayah = useMemo(() => {
    if (!selected) return { ayah_number: 0, verse_key: "1:1", words: [], audio_url: "", timings: [], tafsir: "" };
    if (!live) return selected;
    let cursor = 300;
    const timings: WordTiming[] = live.words.map((w) => {
      const dur = Math.min(1800, Math.max(550, 380 + w.text_uthmani.length * 95));
      const seg = { start_ms: cursor, end_ms: cursor + dur };
      cursor = seg.end_ms + 130;
      return seg;
    });
    const bestAudioUrl = live.audioUrl && live.audioUrl.trim().length > 0
      ? live.audioUrl
      : selected.audio_url || "";
    return {
      ...selected,
      words: live.words,
      audio_url: bestAudioUrl,
      timings,
      tafsir: selected.tafsir || live.tafsir || "",
    };
  }, [selected, live]);

  useEffect(() => {
    engine.load(effectiveSelected.audio_url);
  }, [engine, effectiveSelected.audio_url]);

  useEffect(() => {
    return () => engine.destroy();
  }, [engine]);

  const handleGrade = useCallback((grade: Grade) => {
    if (!selected) return;
    const verseKey = selected.verse_key;
    const prev = memoryStatesRef.current.get(verseKey) ?? EMPTY_SNAPSHOT;
    const outcome = previewSchedule(scheduler, prev, grade, requestRetention);
    memoryStatesRef.current.set(verseKey, outcome);
    setFlash(describeOutcome(outcome, grade));
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 2600);

    const isOnline = navigator.onLine;
    if (!isGuest && isOnline) {
      fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey, grade }),
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as { result: ServerReviewResult };
          const next = toSnapshot(data.result);
          next.lapses =
            grade === "AGAIN" && prev.state !== "SABAQ" ? prev.lapses + 1 : prev.lapses;
          memoryStatesRef.current.set(verseKey, next);
          setFlash(describeOutcome(next, grade));
        })
        .catch(() => {});
    } else {
      offlineReviewQueue.enqueue({ verseKey, grade, timestamp: Date.now() }).then((id) => {
        setFlash(`Offline — review queued (${id.slice(0, 8)})`);
      });
      registerBackgroundSync().catch(() => {});
    }

    const idx = surah.ayahs.findIndex((a) => a.verse_key === selected.verse_key);
    const nextAyah = surah.ayahs[(idx + 1) % surah.ayahs.length];
    if (nextAyah.verse_key !== selected.verse_key) {
      selectAyah(nextAyah.verse_key);
      resetRevealed(nextAyah.verse_key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selected, scheduler, requestRetention, isGuest, surah.ayahs, selectAyah, resetRevealed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (engine.isPlaying()) engine.pause();
        else engine.play();
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(!useReaderStore.getState().helpOpen);
        return;
      }
      const map: Record<string, Grade> = { "1": "AGAIN", "2": "HARD", "3": "GOOD", "4": "EASY" };
      const grade = map[e.key];
      if (grade) handleGrade(grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleGrade, engine, setHelpOpen]);

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
    <AudioSyncProvider engine={engine} timings={effectiveSelected.timings}>
      <LiveWordsContext.Provider
        value={live ? { verseKey: selected!.verse_key, words: live.words } : null}
      >
        <div className="mx-auto max-w-4xl px-4 pb-48 pt-6">
          <header className="mb-5">
            <div className="flex items-center justify-between gap-4">
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
                <p className="mt-1 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  {surah.name_simple} ·{" "}
                  {surah.revelation_place === "makkah" ? "Makkan" : "Madinan"} ·{" "}
                  {surah.ayah_count} verses
                  <Badge variant="success" className="gap-1">
                    <Flame className="h-3 w-3" /> Sabqi
                  </Badge>
                </p>
              </div>
              <nav className="flex shrink-0 items-center gap-1.5">
                {(() => {
                  const idx = availableSurahs.findIndex((s) => s.id === surah.id);
                  const prev = idx > 0 ? availableSurahs[idx - 1] : null;
                  const next = idx >= 0 && idx < availableSurahs.length - 1 ? availableSurahs[idx + 1] : null;
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
                        className="max-w-[150px]"
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

          <MaskingToolbar />

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
                className="fixed bottom-40 right-1/2 z-50 translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-xl dark:bg-amber-600"
              >
                {flash}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5 p-3">
            <AudioControlBar words={effectiveSelected.words} verseKey={selected!.verse_key} syncStatus={syncStatus} />
            <RatingBar verseKey={selected!.verse_key} onGrade={handleGrade} />
          </div>
        </div>

        <TafsirDrawer ayah={effectiveSelected} />
        <HelpSheet />
        <button
          onClick={() => setHelpOpen(!helpOpen)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          className="fixed bottom-44 right-5 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 shadow-lg transition-transform hover:scale-105 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300 cursor-pointer"
        >
          ?
        </button>
      </LiveWordsContext.Provider>
    </AudioSyncProvider>
  );
}
