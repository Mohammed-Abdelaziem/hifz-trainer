"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { SurahBundle } from "@/types/quran";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { useAudioEngine, useVerseData, useAudioSettings, useSurahAudio } from "@/hooks/audio";
import { useReaderStore } from "@/stores/reader-store";
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from "@/lib/constants";
import { Select } from "@/components/ui/select";
import { ReaderStoreHydrator } from "@/components/reader/ReaderStoreHydrator";
import { QuranAudioBar } from "@/components/reader/QuranAudioBar";
import { MediaSessionBridge } from "@/components/reader/MediaSessionBridge";
import { TafsirDrawer } from "@/components/reader/TafsirDrawer";
import { VerseCanvas } from "@/components/reader/VerseCanvas";
import { LiveWordsContext } from "@/components/reader/live-words-context";

interface QuranReaderProps {
  surah: SurahBundle;
  initialVerseKey?: string;
  /** `?play=1` — the previous surah finished and handed playback here. */
  autoPlay?: boolean;
  availableSurahs: { id: number; name_simple: string; ayah_count: number }[];
}

export function QuranReader({ surah, initialVerseKey, autoPlay, availableSurahs }: QuranReaderProps) {
  const router = useRouter();
  const hasAyahs = surah.ayahs.length > 0;
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);
  const layoutMode = useReaderStore((s) => s.layoutMode);
  const fontSizePx = useReaderStore((s) => s.fontSizePx);
  const surahAudioMode = useReaderStore((s) => s.surahAudioMode);
  const reciterId = useReaderStore((s) => s.reciterId);

  const { selected, live, effectiveSelected } = useVerseData(surah, hasAyahs);
  const surahUrl = useCallback((id: number) => `/quran?surah=${id}`, []);
  const autoAdvance = useReaderStore((s) => s.autoAdvance);

  // Fired when the whole-surah MP3 ends: hand playback to the next surah.
  // The engine is remounted per surah (page keys on surahId), so the push
  // always lands on a fresh engine that's sitting idle.
  const handleSurahEnd = useCallback(() => {
    if (!autoAdvance) return;
    const idx = availableSurahs.findIndex((s) => s.id === surah.id);
    if (idx < 0 || idx >= availableSurahs.length - 1) return;
    router.push(`/quran?surah=${availableSurahs[idx + 1].id}&play=1`);
  }, [autoAdvance, availableSurahs, surah.id, router]);

  const engine = useAudioEngine({
    surah,
    selected,
    hasAyahs,
    availableSurahs,
    surahUrl,
    onSurahEnd: handleSurahEnd,
  });
  useAudioSettings(engine);
  const { loading: audioLoading } = useSurahAudio({
    engine,
    surah,
    hasAyahs,
    surahAudioMode,
    reciterId,
    effectiveAudioUrl: effectiveSelected.audio_url,
  });

  // Autoplay pass-through: engine.play() while the surah file is still
  // loading parks playback into pendingPlay until the Howl fires its load
  // event, so starting before the audio is ready is safe. Gated on
  // surahAudioMode so the first render's verse-clip load (the mode is forced
  // on by the route override effect one commit later) cannot consume the
  // pending play before the whole-surah file is on its way. Consumed once —
  // later engine loads (reciter switch) may not re-trigger it.
  const autoPlayConsumed = useRef(false);
  useEffect(() => {
    if (!autoPlay || autoPlayConsumed.current || !surahAudioMode || !hasAyahs || audioLoading) {
      return;
    }
    autoPlayConsumed.current = true;
    engine.play();
  }, [autoPlay, autoPlayConsumed, surahAudioMode, hasAyahs, audioLoading, engine]);

  useEffect(() => {
    if (!hasAyahs) return;
    // This route force-feeds mask/surah-audio overrides to present a plain
    // reading experience. Directly mutating the PERSISTED settings rewrote
    // the user's saved reader-settings forever — /quran went back to FULL
    // masking for the next /reader visit. Capture what was there and put it
    // back on unmount so the visit stays route-scoped.
    const before = useReaderStore.getState();
    const previousMaskMode = before.maskMode;
    const previousSurahAudioMode = before.surahAudioMode;
    useReaderStore.getState().setMaskMode("FULL");
    useReaderStore.getState().setSurahAudioMode(true);
    const target =
      initialVerseKey && surah.ayahs.some((a) => a.verse_key === initialVerseKey)
        ? initialVerseKey
        : surah.ayahs[0].verse_key;
    selectAyah(target);
    resetRevealed(target);
    return () => {
      const restore = useReaderStore.getState();
      if (restore.maskMode === "FULL") restore.setMaskMode(previousMaskMode);
      // Whatever is running while unmounting (the surah audio pass) may have
      // enabled auto-playback that picked a NEW mode — only roll back when the
      // override is still active so actions the user took during the visit are
      // kept.
      restore.setSurahAudioMode(restore.surahAudioMode ? previousSurahAudioMode : false);
    };
  }, [hasAyahs, selectAyah, resetRevealed, surah, initialVerseKey]);

  if (!hasAyahs) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-48 pt-6">
        <header className="mb-5">
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <ArrowLeft className="h-3 w-3" /> Home
          </Link>
          <h1 className="flex items-baseline gap-3">
            <span dir="rtl" lang="ar" className="font-quran text-4xl">
              {surah.name_arabic}
            </span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {surah.name_simple} · {surah.english_name}
          </p>
        </header>
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No verse data available for this surah. Please try another.
          </p>
        </div>
      </div>
    );
  }

  const idx = availableSurahs.findIndex((s) => s.id === surah.id);
  const prev = idx > 0 ? availableSurahs[idx - 1] : null;
  const next = idx >= 0 && idx < availableSurahs.length - 1 ? availableSurahs[idx + 1] : null;

  return (
    <>
      <ReaderStoreHydrator />
      <AudioSyncProvider engine={engine}>
      <MediaSessionBridge surahName={surah.name_simple} verseKey={selected?.verse_key ?? null} />
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
                  <ArrowLeft className="h-3 w-3" /> Home
                </Link>
                <h1 className="flex items-baseline gap-3">
                  <span dir="rtl" lang="ar" className="font-quran text-4xl">
                    {surah.name_arabic}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {surah.name_simple} · {surah.english_name} ·{" "}
                  {surah.revelation_place === "makkah" ? "Makkan" : "Madinan"} ·{" "}
                  {surah.ayah_count} verses
                </p>
              </div>
              <nav className="flex shrink-0 items-center gap-1.5">
                {prev && (
                  <Link
                    href={`/quran?surah=${prev.id}`}
                    title={prev.name_simple}
                    className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    ←
                  </Link>
                )}
                <Select
                  value={String(surah.id)}
                  onChange={(e) => {
                    router.push(`/quran?surah=${e.target.value}`);
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
                    href={`/quran?surah=${next.id}`}
                    title={next.name_simple}
                    className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    →
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 dark:text-stone-400">Layout:</label>
              <Select
                value={layoutMode}
                onChange={(e) => {
                  useReaderStore.getState().setLayoutMode(e.target.value as "FLOW" | "MUSHAF");
                }}
                options={[
                  { value: "FLOW", label: "Flow" },
                  { value: "MUSHAF", label: "Mushaf" },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 dark:text-stone-400">Size:</label>
              <input
                type="range"
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                value={fontSizePx}
                onChange={(e) => useReaderStore.getState().setFontSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="w-8 text-right text-xs tabular-nums text-stone-500 dark:text-stone-400">
                {fontSizePx}
              </span>
            </div>
          </div>

          <main className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
            <VerseCanvas surah={surah} />
          </main>

          <p className="mt-3 text-center text-xs text-stone-400">
            Click an ayah to select it for audio playback · Use the controls below to play
          </p>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
          <div className="mx-auto max-w-4xl p-3">
            {audioLoading && (
              <div className="flex items-center justify-center gap-2 pb-1 text-xs text-stone-500 dark:text-stone-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading audio...
              </div>
            )}
            <QuranAudioBar surahId={surah.id} ayahCount={surah.ayah_count} verseKey={selected!.verse_key} />
          </div>
        </div>

        <TafsirDrawer ayah={effectiveSelected} />
      </LiveWordsContext.Provider>
      </AudioSyncProvider>
    </>
  );
}
