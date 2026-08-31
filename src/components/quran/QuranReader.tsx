"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Ayah, QuranWord, SurahBundle, WordTiming } from "@/types/quran";
import { AudioEngine } from "@/lib/audio/engine";
import { AudioSyncProvider } from "@/hooks/use-audio-sync";
import { useReaderStore } from "@/stores/reader-store";
import { Select } from "@/components/ui/select";
import { AudioControlBar } from "@/components/reader/AudioControlBar";
import { TafsirDrawer } from "@/components/reader/TafsirDrawer";
import { VerseCanvas } from "@/components/reader/VerseCanvas";
import { LiveWordsContext } from "@/components/reader/live-words-context";

interface QuranReaderProps {
  surah: SurahBundle;
  initialVerseKey?: string;
  availableSurahs: { id: number; name_simple: string; ayah_count: number }[];
}

export function QuranReader({ surah, initialVerseKey, availableSurahs }: QuranReaderProps) {
  const engine = useMemo(() => new AudioEngine(), []);
  const router = useRouter();
  const [liveState, setLiveState] = useState<{
    key: string;
    words: QuranWord[];
    audioUrl: string | null;
    tafsir: string | null;
  } | null>(null);

  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);
  const reciterId = useReaderStore((s) => s.reciterId);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const resetRevealed = useReaderStore((s) => s.resetRevealed);
  const layoutMode = useReaderStore((s) => s.layoutMode);
  const fontSizePx = useReaderStore((s) => s.fontSizePx);

  const selected: Ayah =
    surah.ayahs.find((a) => a.verse_key === selectedVerseKey) ?? surah.ayahs[0];

  useEffect(() => {
    useReaderStore.persist.rehydrate();
    const store = useReaderStore.getState();
    store.setMaskMode("FULL");
    const target =
      initialVerseKey && surah.ayahs.some((a) => a.verse_key === initialVerseKey)
        ? initialVerseKey
        : surah.ayahs[0].verse_key;
    selectAyah(target);
    resetRevealed(target);
  }, [selectAyah, resetRevealed, surah, initialVerseKey]);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/ayah-data?verseKey=${encodeURIComponent(selectedVerseKey)}&reciter=${reciterId}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: { words?: QuranWord[]; recitationUrl?: string | null; tafsir?: string | null } | null
        ) => {
          if (!cancelled && data?.words?.length) {
            setLiveState({
              key: `${selectedVerseKey}:${reciterId}`,
              words: data.words,
              audioUrl: data.recitationUrl ?? null,
              tafsir: data.tafsir ?? null,
            });
          }
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedVerseKey, reciterId]);

  const live =
    liveState && liveState.key === `${selectedVerseKey}:${reciterId}` ? liveState : null;

  const effectiveSelected: Ayah = useMemo(() => {
    if (!live) return selected;
    let cursor = 300;
    const timings: WordTiming[] = live.words.map((w) => {
      const dur = Math.min(1800, Math.max(550, 380 + w.text_uthmani.length * 95));
      const seg = { start_ms: cursor, end_ms: cursor + dur };
      cursor = seg.end_ms + 130;
      return seg;
    });
    return {
      ...selected,
      words: live.words,
      audio_url: live.audioUrl ?? selected.audio_url,
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (engine.isPlaying()) engine.pause();
        else engine.play();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine]);

  const idx = availableSurahs.findIndex((s) => s.id === surah.id);
  const prev = idx > 0 ? availableSurahs[idx - 1] : null;
  const next = idx >= 0 && idx < availableSurahs.length - 1 ? availableSurahs[idx + 1] : null;

  return (
    <AudioSyncProvider engine={engine} timings={effectiveSelected.timings}>
      <LiveWordsContext.Provider
        value={live ? { verseKey: selected.verse_key, words: live.words } : null}
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
                  onChange={(e) => router.push(`/quran?surah=${e.target.value}`)}
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
                  const store = useReaderStore.getState();
                  store.setLayoutMode(e.target.value as "FLOW" | "MUSHAF");
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
            <AudioControlBar
              words={effectiveSelected.words}
              verseKey={selected.verse_key}
            />
          </div>
        </div>

        <TafsirDrawer ayah={effectiveSelected} />
      </LiveWordsContext.Provider>
    </AudioSyncProvider>
  );
}
