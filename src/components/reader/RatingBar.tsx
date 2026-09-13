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
  description: string;
}[] = [
  {
    grade: "AGAIN",
    label: "Again",
    icon: RotateCcw,
    classes:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40",
    hotkey: "1",
    description: "Re-learn",
  },
  {
    grade: "HARD",
    label: "Hard",
    icon: Plus,
    classes:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40",
    hotkey: "2",
    description: "Struggled",
  },
  {
    grade: "GOOD",
    label: "Good",
    icon: Check,
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40",
    hotkey: "3",
    description: "Recalled",
  },
  {
    grade: "EASY",
    label: "Easy",
    icon: Minus,
    classes:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/40",
    hotkey: "4",
    description: "Instant",
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
        Rate {verseKey}
      </span>
      <div className="flex flex-1 items-stretch gap-1.5">
        {GRADE_BUTTONS.map(({ grade, label, icon: Icon, classes, hotkey, description }) => (
          <button
            key={grade}
            onClick={() => onGrade(grade)}
            title={`${label} — ${description} (key: ${hotkey})`}
            className={cn(
              "group inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm font-medium transition-all sm:flex-none sm:px-3",
              classes
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            <kbd className="ml-0.5 hidden rounded border border-current/20 bg-current/5 px-1 text-[10px] opacity-50 transition-opacity group-hover:opacity-100 lg:inline">
              {hotkey}
            </kbd>
          </button>
        ))}
      </div>
    </div>
  );
}
