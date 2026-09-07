"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SurahBundle } from "@/types/quran";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { useAudioEngine, useVerseData, useAudioSettings } from "@/hooks/audio";
import { useReaderStore } from "@/stores/reader-store";
import { Select } from "@/components/ui/select";
import { QuranAudioBar } from "@/components/reader/QuranAudioBar";
import { TafsirDrawer } from "@/components/reader/TafsirDrawer";
import { VerseCanvas } from "@/components/reader/VerseCanvas";
import { LiveWordsContext } from "@/components/reader/live-words-context";

interface QuranReaderProps {
  surah: SurahBundle;
  initialVerseKey?: string;
  availableSurahs: { id: number; name_simple: string; ayah_count: number }[];
}

export function QuranReader({ surah, initialVerseKey, availableSurahs }: QuranReaderProps) {
  const hasAyahs = surah.ayahs.length > 0;
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);
  const layoutMode = useReaderStore((s) => s.layoutMode);
  const fontSizePx = useReaderStore((s) => s.fontSizePx);

  const { selected, live, effectiveSelected } = useVerseData(surah, hasAyahs);
  const engine = useAudioEngine({ surah, selected, hasAyahs });
  useAudioSettings(engine);

  useEffect(() => {
    if (!hasAyahs) return;
    useReaderStore.persist.rehydrate();
    useReaderStore.getState().setMaskMode("FULL");
    const target =
      initialVerseKey && surah.ayahs.some((a) => a.verse_key === initialVerseKey)
        ? initialVerseKey
        : surah.ayahs[0].verse_key;
    selectAyah(target);
    resetRevealed(target);
  }, [hasAyahs, selectAyah, resetRevealed, surah, initialVerseKey]);

  useEffect(() => {
    engine.load(effectiveSelected.audio_url);
  }, [engine, effectiveSelected.audio_url]);

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
                    window.location.href = `/quran?surah=${e.target.value}`;
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
                min={22}
                max={56}
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
            <QuranAudioBar />
          </div>
        </div>

        <TafsirDrawer ayah={effectiveSelected} />
      </LiveWordsContext.Provider>
    </AudioSyncProvider>
  );
}
