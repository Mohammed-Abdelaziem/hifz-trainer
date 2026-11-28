"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ayah, SchedulerKind, SurahBundle } from "@/types/quran";
import type { SurahProgress, SurahVerseState } from "@/types/srs";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { usePassiveReadingTracker } from "@/hooks/use-passive-reading-tracker";
import { useListenCount } from "@/hooks/use-listen-count";
import { useSwSyncStatus } from "@/hooks/use-sw-sync-status";
import { useBottomSheetHeight } from "@/hooks/use-bottom-sheet-height";
import { useReaderShortcuts } from "@/hooks/use-reader-shortcuts";
import { useReaderMutations } from "@/hooks/use-reader-mutations";
import { useAudioEngine, useVerseData, useAudioSettings, useSurahAudio } from "@/hooks/audio";
import { GRADE_FLASH_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useReaderStore } from "@/stores/reader-store";
import { ReaderHeader } from "./ReaderHeader";
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
import { RecallDrillModal } from "./RecallDrillModal";
import { LiveWordsContext } from "./live-words-context";

export function ReaderWorkspace({
  surah,
  initialVerseKey,
  scheduler,
  requestRetention,
  availableSurahs,
  progress,
  initialVerseStates,
  isGuest,
}: {
  surah: SurahBundle;
  initialVerseKey?: string;
  scheduler: SchedulerKind;
  requestRetention: number;
  availableSurahs: { id: number; name_simple: string }[];
  progress: SurahProgress | null;
  initialVerseStates?: Record<string, SurahVerseState>;
  isGuest?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshProgress = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["memory-map"] });
    void queryClient.invalidateQueries({ queryKey: ["queue"] });
    void queryClient.invalidateQueries({ queryKey: ["stats"] });
    void queryClient.invalidateQueries({ queryKey: ["pace"] });
    router.refresh();
  }, [queryClient, router]);

  const hasAyahs = surah.ayahs.length > 0;
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncStatus = useSwSyncStatus();

  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);
  const surahAudioMode = useReaderStore((s) => s.surahAudioMode);
  const reciterId = useReaderStore((s) => s.reciterId);
  const bulkMode = useReaderStore((s) => s.bulkMode);
  const setBulkMode = useReaderStore((s) => s.setBulkMode);
  const bulkSelected = useReaderStore((s) => s.bulkSelected);
  const clearBulkSelection = useReaderStore((s) => s.clearBulkSelection);
  const layoutMode = useReaderStore((s) => s.layoutMode);

  const [quizAyahs, setQuizAyahs] = useState<Ayah[] | null>(null);
  const [drillOpen, setDrillOpen] = useState(false);

  useEffect(() => {
    if (bulkMode && layoutMode === "MUSHAF") setBulkMode(false);
  }, [bulkMode, layoutMode, setBulkMode]);

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

  // Only initialize selection when the surah or ?verse= query actually changes.
  // router.refresh() after grading/marking known passes a new `surah` object
  // reference for the same surah.id — depending on `surah` directly yanked the
  // user back to ayah 1 after every single grade or known-mark!
  const lastInitKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hasAyahs) return;
    const initKey = `${surah.id}:${initialVerseKey ?? ""}`;
    if (lastInitKeyRef.current === initKey) return;
    lastInitKeyRef.current = initKey;
    const requested =
      initialVerseKey && surah.ayahs.some((a) => a.verse_key === initialVerseKey)
        ? initialVerseKey
        : null;
    const target = requested ?? surah.ayahs[0].verse_key;
    selectAyah(target);
    resetRevealed(target);
  }, [hasAyahs, selectAyah, resetRevealed, surah.id, surah.ayahs, initialVerseKey]);

  usePassiveReadingTracker(selected?.verse_key, !isGuest && hasAyahs);
  const listenCount = useListenCount(selected?.verse_key ?? null, !isGuest && hasAyahs);

  useSurahAudio({
    engine,
    surah,
    hasAyahs,
    surahAudioMode,
    reciterId,
    effectiveAudioUrl: effectiveSelected.audio_url,
  });

  useBottomSheetHeight("reader-bottom-sheet");

  const flashFor = useCallback((message: string) => {
    setFlash(message);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), GRADE_FLASH_MS);
  }, []);

  const jumpToAyah = useCallback(
    (raw: string): boolean => {
      const value = raw.trim();
      if (!value) return false;
      let m = /^(\d+)$/.exec(value);
      if (m) {
        const n = Number(m[1]);
        if (n < 1 || n > surah.ayah_count) {
          flashFor(`${surah.name_simple} has ${surah.ayah_count} verses`);
          return false;
        }
        selectAyah(`${surah.id}:${n}`);
        resetRevealed(`${surah.id}:${n}`);
        return true;
      }
      m = /^(\d+):(\d+)$/.exec(value);
      if (m) {
        const s = Number(m[1]);
        const n = Number(m[2]);
        if (s === surah.id) {
          if (n < 1 || n > surah.ayah_count) {
            flashFor(`${surah.name_simple} has ${surah.ayah_count} verses`);
            return false;
          }
          selectAyah(`${s}:${n}`);
          resetRevealed(`${s}:${n}`);
          return true;
        }
        router.push(`/reader/${s}?verse=${s}:${n}`);
        return true;
      }
      flashFor("Enter an ayah number (e.g. 7) or surah:ayah (e.g. 2:255)");
      return false;
    },
    [surah.id, surah.name_simple, surah.ayah_count, selectAyah, resetRevealed, router, flashFor]
  );

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

  const {
    verseStateMap,
    markingSurah,
    isSurahFullyKnown,
    sessionGraded,
    handleGrade,
    handleKnown,
    handleKnownSurah,
  } = useReaderMutations({
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
  });

  useReaderShortcuts({
    disabled: quizAyahs !== null || drillOpen,
    onGrade: handleGrade,
    onKnown: handleKnown,
    onKnownSurah: handleKnownSurah,
  });

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
          <ReaderHeader
            surah={surah}
            progress={progress}
            availableSurahs={availableSurahs}
            onJumpToAyah={jumpToAyah}
          />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <MaskingToolbar />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDrillOpen(true)}
                title="Active-recall drills: recite word by word or predict the next verse opening"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                Recall drill
              </button>
              <button
                type="button"
                onClick={handleKnownSurah}
                disabled={isSurahFullyKnown || markingSurah}
                title={`Mark all ${surah.ayah_count} verses of ${surah.name_simple} as already known (key: Shift + 5)`}
                aria-label={`Mark Surah ${surah.name_simple} as already known`}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  isSurahFullyKnown
                    ? "border-teal-600 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                    : "border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-800 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                )}
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    isSurahFullyKnown && "fill-current text-teal-600 dark:text-teal-400"
                  )}
                />
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
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
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
            <VerseCanvas surah={surah} verseStates={verseStateMap} />
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
                className="fixed right-1/2 bottom-[calc(var(--bottom-sheet-h,9rem)+1rem)] z-50 translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-xl dark:bg-amber-600"
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
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5 px-3 pt-3 pb-16 md:pb-3">
            {bulkMode && (
              <BulkActionBar
                allKeys={surah.ayahs.map((a) => a.verse_key)}
                isGuest={!!isGuest}
                onResult={flashFor}
                onProgressChange={refreshProgress}
                onQuiz={() => {
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

        {drillOpen && (
          <RecallDrillModal
            ayahs={surah.ayahs}
            surahName={surah.name_simple}
            focusVerseKey={selected!.verse_key}
            isGuest={!!isGuest}
            onClose={() => setDrillOpen(false)}
            onResult={flashFor}
            onProgressChange={refreshProgress}
          />
        )}

        <TafsirDrawer ayah={effectiveSelected} />
        <HelpSheet />
      </LiveWordsContext.Provider>
    </AudioSyncProvider>
  );
}
