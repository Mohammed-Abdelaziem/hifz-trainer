"use client";

import { Fragment, memo, useCallback, useEffect, useRef, useState } from "react";
import type { SurahBundle } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";
import { usePlayback } from "@/hooks/use-audio-sync";
import { useLiveWords } from "./live-words-context";
import { cn, toArabicDigits } from "@/lib/utils";
import { Check } from "lucide-react";
import { VerseWord } from "./VerseWord";
import { VERSE_CHUNK } from "@/lib/constants";

function AyahMarker({ number }: { number: number }) {
  return (
    <span className="mx-2 inline-flex h-8 w-8 select-none items-center justify-center rounded-full border-2 border-amber-600/70 text-sm font-semibold text-amber-700 dark:border-amber-500/60 dark:text-amber-400">
      {toArabicDigits(number)}
    </span>
  );
}

function FlowAyah({
  surah,
  ayahIndex,
  bulkMode,
  bulkChecked,
  onBulkToggle,
}: {
  surah: SurahBundle;
  ayahIndex: number;
  bulkMode?: boolean;
  bulkChecked?: boolean;
  onBulkToggle?: (verseKey: string, index: number, extend: boolean) => void;
}) {
  const ayah = surah.ayahs[ayahIndex];
  const maskMode = useReaderStore((s) => s.maskMode);
  const blurScope = useReaderStore((s) => s.blurScope);
  const showVerseTranslation = useReaderStore((s) => s.showVerseTranslation);
  const showRoots = useReaderStore((s) => s.showRoots);
  const revealedWords = useReaderStore((s) => s.revealedWords);
  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);
  const revealWord = useReaderStore((s) => s.revealWord);
  const revealAll = useReaderStore((s) => s.revealAll);
  const selectAyah = useReaderStore((s) => s.selectAyah);
  const live = useLiveWords();

  const isSelected = selectedVerseKey === ayah.verse_key;
  const activeIndex = usePlayback((p) => (isSelected ? p.activeIndex : -1));
  const words =
    live && live.verseKey === ayah.verse_key ? live.words : ayah.words;

  const ayahScoped = maskMode === "BLUR" && blurScope === "ayah";
  const allRevealed = ayahScoped && words.every((w) => revealedWords.has(w.id));

  // Stable across renders, otherwise memo() on VerseWord never hits and a
  // single tap re-renders every mounted word's framer-motion layout.
  const handleReveal = useCallback(
    (wordId: string) => {
      if (!isSelected) selectAyah(ayah.verse_key);
      revealWord(wordId);
    },
    [isSelected, selectAyah, ayah.verse_key, revealWord]
  );

  return (
    <div
      data-verse={ayah.verse_key}
      tabIndex={0}
      role="group"
      aria-label={`Ayah ${ayah.ayah_number}`}
      onClick={(e) => {
        // Bulk mode replaces click-to-select: a tap toggles membership and
        // shift-click fills the range since the last tap.
        if (bulkMode) {
          if (!isSelected) selectAyah(ayah.verse_key);
          onBulkToggle?.(ayah.verse_key, ayahIndex, e.shiftKey);
          return;
        }
        if (!isSelected) selectAyah(ayah.verse_key);
      }}
      onKeyDown={(e) => {
        // Keyboard parity with click-to-select: without this only VerseWord
        // spans were reachable and an entire ayah was unselectable by keyboard.
        if ((e.key === "Enter" || e.key === " ") && (bulkMode || !isSelected)) {
          e.preventDefault();
          if (bulkMode) onBulkToggle?.(ayah.verse_key, ayahIndex, e.shiftKey);
          else selectAyah(ayah.verse_key);
        }
      }}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-transparent px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
        isSelected
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-700/50 dark:bg-amber-950/20"
          : "hover:bg-stone-50 dark:hover:bg-stone-800/40",
        bulkChecked &&
          "border-amber-400 bg-amber-50/60 dark:border-amber-500/60 dark:bg-amber-950/30",
        showRoots ? "pb-12" : ""
      )}
    >
      {bulkMode && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-3 left-3 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
            bulkChecked
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-stone-300 bg-white/80 dark:border-stone-600 dark:bg-stone-800/80"
          )}
        >
          {bulkChecked && <Check className="h-3 w-3" />}
        </span>
      )}
      <p dir="rtl" lang="ar" className="text-right leading-[2.3]">
          {ayahScoped && !allRevealed ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (!isSelected) selectAyah(ayah.verse_key);
                revealAll(words.map((w) => w.id));
              }}
              className="inline cursor-pointer blur-[6px] transition-[filter] duration-300 hover:blur-[3px]"
              title="Tap to reveal entire verse"
            >
              {words.map((word) => (
                <span key={word.id} className="mx-[0.12em]">
                  {word.text_uthmani}
                </span>
              ))}
            </span>
          ) : (
            words.map((word, i) => (
              <VerseWord
                key={word.id}
                word={word}
                mode={maskMode}
                revealed={revealedWords.has(word.id)}
                active={i === activeIndex}
                showRoots={showRoots && isSelected}
                ayahScoped={ayahScoped}
                onReveal={handleReveal}
              />
            ))
          )}
          <span className={cn(isSelected && "ring-2 ring-amber-400 rounded-full")}>
            <AyahMarker number={ayah.ayah_number} />
          </span>
        </p>
        {showVerseTranslation && ayah.translation && (
          <p
            dir="ltr"
            lang="en"
            data-testid="verse-translation"
            className={cn(
              "border-s-2 border-sky-300/70 ps-3 text-sm font-normal leading-relaxed text-stone-600 dark:border-sky-500/50 dark:text-stone-400",
              // Clear the absolutely-positioned roots layer when the toggle is
              // active so the lines never collide.
              showRoots ? "mt-12" : "mt-2"
            )}
          >
            {ayah.translation}
          </p>
        )}
      </div>
  );
}

function MushafFlow({ ayahs }: { ayahs: SurahBundle["ayahs"] }) {
  const maskMode = useReaderStore((s) => s.maskMode);
  const blurScope = useReaderStore((s) => s.blurScope);
  const revealedWords = useReaderStore((s) => s.revealedWords);
  const revealWord = useReaderStore((s) => s.revealWord);
  const revealAll = useReaderStore((s) => s.revealAll);
  const selectAyah = useReaderStore((s) => s.selectAyah);

  const ayahScoped = maskMode === "BLUR" && blurScope === "ayah";

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{ textAlign: "justify", textAlignLast: "center" }}
      className="leading-[2.6]"
    >
      {ayahs.map((ayah) => {
        const allRevealed = ayahScoped && ayah.words.every((w) => revealedWords.has(w.id));
        // Grade-advance (handleGrade â†’ requestAnimationFrame scroll) finds verses
        // by data-verse; without the anchor here the querySelector missed in
        // Mushaf layout and scrolled the window to the top instead.
        return (
          <span key={ayah.verse_key} data-verse={ayah.verse_key}>
            {ayahScoped && !allRevealed ? (
              <span
                onClick={() => {
                  revealAll(ayah.words.map((w) => w.id));
                }}
                className="inline cursor-pointer blur-[6px] transition-[filter] duration-300 hover:blur-[3px]"
                title={`Tap to reveal ${ayah.verse_key}`}
              >
                {ayah.words.map((w) => (
                  <span key={w.id} className="mx-[0.12em]">
                    {w.text_uthmani}
                  </span>
                ))}
              </span>
            ) : (
              ayah.words.map((word) => (
                <Fragment key={word.id}>
                  <VerseWord
                    word={word}
                    mode={maskMode}
                    revealed={revealedWords.has(word.id)}
                    active={false}
                    showRoots={false}
                    ayahScoped={ayahScoped}
                    // Passing the store's stable action by reference keeps the
                    // VerseWord memo() functional; the earlier inline arrow
                    // rebuilt every word's props on each render.
                    onReveal={revealWord}
                  />
                </Fragment>
              ))
            )}
            <button
              onClick={() => selectAyah(ayah.verse_key)}
              title={`Select ${ayah.verse_key}`}
              className="cursor-pointer align-middle"
            >
              <AyahMarker number={ayah.ayah_number} />
            </button>{" "}
          </span>
        );
      })}
    </div>
  );
}

export const VerseCanvas = memo(function VerseCanvas({ surah }: { surah: SurahBundle }) {
  const layoutMode = useReaderStore((s) => s.layoutMode);
  const fontSizePx = useReaderStore((s) => s.fontSizePx);
  const selectedVerseKey = useReaderStore((s) => s.selectedVerseKey);
  const bulkMode = useReaderStore((s) => s.bulkMode);
  const bulkSelected = useReaderStore((s) => s.bulkSelected);
  const toggleBulkVerse = useReaderStore((s) => s.toggleBulkVerse);
  const setBulkRange = useReaderStore((s) => s.setBulkRange);

  // Shift-click range anchor: the index of the last toggled verse. UI-only,
  // so it lives here rather than in the persisted store.
  const lastToggledIndex = useRef<number | null>(null);
  const handleBulkToggle = useCallback(
    (verseKey: string, index: number, extend: boolean) => {
      if (extend && lastToggledIndex.current !== null) {
        // Fill the ordered range between the anchor and this tap (inclusive).
        const lo = Math.min(lastToggledIndex.current, index);
        const hi = Math.max(lastToggledIndex.current, index);
        const keys = surah.ayahs.slice(lo, hi + 1).map((a) => a.verse_key);
        setBulkRange(keys);
        return;
      }
      lastToggledIndex.current = index;
      toggleBulkVerse(verseKey);
    },
    [surah.ayahs, setBulkRange, toggleBulkVerse]
  );

  const selectedIndex = surah.ayahs.findIndex((a) => a.verse_key === selectedVerseKey);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(surah.ayahs.length, Math.max(VERSE_CHUNK, (selectedIndex < 0 ? 0 : selectedIndex) + 5))
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const minVisibleForSelection = selectedIndex >= 0
    ? Math.min(surah.ayahs.length, selectedIndex + 5)
    : VERSE_CHUNK;
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
          setVisibleCount((v) => Math.min(surah.ayahs.length, v + VERSE_CHUNK));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, surah.ayahs.length]);

  useEffect(() => {
    if (!selectedVerseKey) return;
    const el = document.querySelector(`[data-verse="${selectedVerseKey}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [selectedVerseKey]);

  const visibleAyahs = surah.ayahs.slice(0, visibleCount);
  const remaining = surah.ayahs.length - visibleCount;

  const showMore = remaining > 0 && (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        onClick={() => setVisibleCount((v) => Math.min(surah.ayahs.length, v + VERSE_CHUNK))}
        className="cursor-pointer rounded-lg border border-stone-300 px-4 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        Show {Math.min(VERSE_CHUNK, remaining)} more verses
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
            <FlowAyah
              key={surah.ayahs[idx].verse_key}
              surah={surah}
              ayahIndex={idx}
              bulkMode={bulkMode}
              bulkChecked={bulkSelected.includes(surah.ayahs[idx].verse_key)}
              onBulkToggle={handleBulkToggle}
            />
          ))}
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      {showMore}
    </div>
  );
});
