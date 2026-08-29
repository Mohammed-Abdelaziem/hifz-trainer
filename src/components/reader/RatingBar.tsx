"use client";

import { Check, Minus, Plus, RotateCcw } from "lucide-react";
import type { Grade } from "@/types/quran";
import { cn } from "@/lib/utils";

const GRADE_BUTTONS: {
  grade: Grade;
  label: string;
  icon: typeof RotateCcw;
  classes: string;
  hotkey: string;
}[] = [
  {
    grade: "AGAIN",
    label: "Again",
    icon: RotateCcw,
    classes:
      "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40",
    hotkey: "1",
  },
  {
    grade: "HARD",
    label: "Hard",
    icon: Plus,
    classes:
      "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40",
    hotkey: "2",
  },
  {
    grade: "GOOD",
    label: "Good",
    icon: Check,
    classes:
      "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40",
    hotkey: "3",
  },
  {
    grade: "EASY",
    label: "Easy",
    icon: Minus,
    classes:
      "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/40",
    hotkey: "4",
  },
];

export function RatingBar({
  verseKey,
  onGrade,
}: {
  verseKey: string;
  onGrade: (grade: Grade) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 hidden text-xs font-medium uppercase tracking-wide text-stone-400 sm:inline">
        Rate recall of {verseKey}
      </span>
      <div className="flex flex-1 items-stretch gap-2">
        {GRADE_BUTTONS.map(({ grade, label, icon: Icon, classes, hotkey }) => (
          <button
            key={grade}
            onClick={() => onGrade(grade)}
            title={`${label} (${hotkey})`}
            className={cn(
              "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
              classes
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <kbd className="ml-1 hidden rounded border border-current/30 px-1 text-[10px] opacity-60 lg:inline">
              {hotkey}
            </kbd>
          </button>
        ))}
      </div>
    </div>
  );
}
