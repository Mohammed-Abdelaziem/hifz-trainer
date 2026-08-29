"use client";

import { Fragment, memo, useEffect, useRef, useState } from "react";
import type { SurahBundle } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";
import { usePlayback } from "@/hooks/use-audio-sync";
import { useLiveWords } from "./live-words-context";
import { cn, toArabicDigits } from "@/lib/utils";
import { VerseWord } from "./VerseWord";

const CHUNK = 15;

function AyahMarker({ number }: { number: number }) {
  return (
    <span className="mx-2 inline-flex h-8 w-8 select-none items-center justify-center rounded-full border-2 border-amber-600/70 text-sm font-semibold text-amber-700 dark:border-amber-500/60 dark:text-amber-400">
      {toArabicDigits(number)}
    </span>
  );
}

function FlowAyah({ surah, ayahIndex }: { surah: SurahBundle; ayahIndex: number }) {
  const ayah = surah.ayahs[ayahIndex];
  const maskMode = useReaderStore((s) => s.maskMode);
  const showTranslation = useReaderStore((s) => s.showTranslation);
  const showRoots = useReaderStore((s) => s.showRoots);
  const revealedWords = useReaderStore((s) => s.revealedWords);
  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);
  const revealWord = useReaderStore((s) => s.revealWord);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const live = useLiveWords();

  const isSelected = selectedVerseKey === ayah.verse_key;
  const activeIndex = usePlayback((p) => (isSelected ? p.activeIndex : -1));
  const words =
    live && live.verseKey === ayah.verse_key ? live.words : ayah.words;

  return (
    <div
      onClick={() => !isSelected && selectAyah(ayah.verse_key)}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-transparent px-4 py-3 transition-colors",
        isSelected
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-700/50 dark:bg-amber-950/20"
          : "hover:bg-stone-50 dark:hover:bg-stone-800/40",
        showTranslation || showRoots ? "pb-12" : ""
      )}
    >
      <p dir="rtl" lang="ar" className="text-right leading-[2.3]">
          {words.map((word, i) => (
            <VerseWord
              key={word.id}
              word={word}
              mode={maskMode}
              revealed={revealedWords.has(word.id)}
              active={i === activeIndex}
              showTranslation={showTranslation && isSelected}
              showRoots={showRoots && isSelected}
              onReveal={() => {
                if (!isSelected) selectAyah(ayah.verse_key);
                revealWord(word.id);
              }}
            />
          ))}
          <span className={cn(isSelected && "ring-2 ring-amber-400 rounded-full")}>
            <AyahMarker number={ayah.ayah_number} />
          </span>
        </p>
    </div>
  );
}

function MushafFlow({ ayahs }: { ayahs: SurahBundle["ayahs"] }) {
  const maskMode = useReaderStore((s) => s.maskMode);
  const revealedWords = useReaderStore((s) => s.revealedWords);
  const revealWord = useReaderStore((s) => s.revealWord);
  const selectAyah = useReaderStore((s) => s.selectAyah);

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{ textAlign: "justify", textAlignLast: "center" }}
      className="leading-[2.6]"
    >
      {ayahs.map((ayah) => (
        <span key={ayah.verse_key}>
          {ayah.words.map((word) => (
            <Fragment key={word.id}>
              <VerseWord
                word={word}
                mode={maskMode}
                revealed={revealedWords.has(word.id)}
                active={false}
                showTranslation={false}
                showRoots={false}
                onReveal={() => revealWord(word.id)}
              />{" "}
            </Fragment>
          ))}
          <button
            onClick={() => selectAyah(ayah.verse_key)}
            title={`Select ${ayah.verse_key}`}
            className="cursor-pointer align-middle"
          >
            <AyahMarker number={ayah.ayah_number} />
          </button>{" "}
        </span>
      ))}
    </div>
  );
}

export const VerseCanvas = memo(function VerseCanvas({ surah }: { surah: SurahBundle }) {
  const layoutMode = useReaderStore((s) => s.layoutMode);
  const fontSizePx = useReaderStore((s) => s.fontSizePx);
  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);

  const playing = usePlayback((p) => p.playing);

  const selectedIndex = surah.ayahs.findIndex((a) => a.verse_key === selectedVerseKey);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(surah.ayahs.length, Math.max(CHUNK, (selectedIndex < 0 ? 0 : selectedIndex) + 5))
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const minVisibleForSelection = selectedIndex >= 0
    ? Math.min(surah.ayahs.length, selectedIndex + 5)
    : CHUNK;
  if (visibleCount < minVisibleForSelection) {
    setVisibleCount(minVisibleForSelection);
  }

  useEffect(() => {
    if (visibleCount >= surah.ayahs.length) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((v) => Math.min(surah.ayahs.length, v + CHUNK));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, surah.ayahs.length]);

  useEffect(() => {
    if (!playing || layoutMode !== "FLOW" || !selectedVerseKey) return;
    document
      .querySelector('[data-active="true"]')
      ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }, [playing, layoutMode, selectedVerseKey]);

  const visibleAyahs = surah.ayahs.slice(0, visibleCount);
  const remaining = surah.ayahs.length - visibleCount;

  const showMore = remaining > 0 && (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        onClick={() => setVisibleCount((v) => Math.min(surah.ayahs.length, v + CHUNK))}
        className="cursor-pointer rounded-lg border border-stone-300 px-4 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        Show {Math.min(CHUNK, remaining)} more verses
      </button>
      <p className="text-[11px] text-stone-400">
        {visibleCount} of {surah.ayahs.length} rendered
      </p>
    </div>
  );

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{ fontSize: `${fontSizePx}px`, lineHeight: layoutMode === "MUSHAF" ? 2.4 : 2.1 }}
      className="font-quran text-stone-900 dark:text-stone-100"
    >
      {layoutMode === "MUSHAF" ? (
        <div className="rounded-lg bg-[repeating-linear-gradient(0deg,rgba(180,83,9,0.05)_0px,rgba(180,83,9,0.05)_1px,transparent_1px,transparent_2.6em)] border-x-4 border-amber-800/30 bg-gradient-to-b from-amber-50 to-orange-50/50 p-5 dark:border-amber-200/20 dark:from-stone-900 dark:to-stone-900">
          <MushafFlow ayahs={visibleAyahs} />
        </div>
      ) : (
        <div className="space-y-2">
          {visibleAyahs.map((_, idx) => (
            <FlowAyah key={surah.ayahs[idx].verse_key} surah={surah} ayahIndex={idx} />
          ))}
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      {showMore}
    </div>
  );
});
