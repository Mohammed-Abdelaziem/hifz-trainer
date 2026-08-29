"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { MaskMode, QuranWord } from "@/types/quran";
import { cn } from "@/lib/utils";

interface VerseWordProps {
  word: QuranWord;
  mode: MaskMode;
  revealed: boolean;
  active: boolean;
  showTranslation: boolean;
  showRoots: boolean;
  onReveal: () => void;
}

function firstLetterPrompt(text: string): string {
  const chars = Array.from(text);
  const first = chars[0];
  const tatweelCount = Math.max(1, Math.min(4, Math.floor(chars.length / 3)));
  return first + "ـ".repeat(tatweelCount);
}

export const VerseWord = memo(function VerseWord({
  word,
  mode,
  revealed,
  active,
  showTranslation,
  showRoots,
  onReveal,
}: VerseWordProps) {
  const masked =
    mode !== "FULL" && !revealed;

  let display = word.text_uthmani;
  if (masked && mode === "BLUR") display = word.text_uthmani;
  if (masked && mode === "FIRST_LETTER") display = firstLetterPrompt(word.text_uthmani);

  return (
    <motion.span
      layout="position"
      data-active={active || undefined}
      onClick={masked ? onReveal : undefined}
      className={cn(
        "relative mx-[0.12em] inline-flex cursor-default flex-col items-center align-bottom",
        masked && "cursor-pointer",
        masked && mode === "BLUR" && "blur-[6px] transition-[filter] duration-300",
        masked && mode === "REVEAL" && "text-transparent decoration-dotted underline underline-offset-8 decoration-stone-400 dark:decoration-stone-600",
        active &&
          "rounded-md bg-amber-200/80 px-1 shadow-sm ring-1 ring-amber-400/60 dark:bg-amber-500/30 dark:ring-amber-500/40"
      )}
    >
      <span className="whitespace-pre">{display}</span>
      {(showTranslation || showRoots) && !masked && (
        <span className="pointer-events-none absolute top-full mt-1 flex flex-col items-center whitespace-nowrap">
          {showTranslation && (
            <span dir="ltr" className="text-[10px] leading-tight text-sky-700/90 dark:text-sky-300/90">
              {word.translation}
            </span>
          )}
          {showRoots && word.root && (
            <span dir="rtl" className="text-[10px] leading-tight text-emerald-700/90 dark:text-emerald-300/90">
              ({word.root})
            </span>
          )}
        </span>
      )}
    </motion.span>
  );
});
