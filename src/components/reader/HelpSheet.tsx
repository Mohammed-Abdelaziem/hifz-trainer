"use client";

import { Keyboard } from "lucide-react";
import { useReaderStore } from "@/stores/reader-store";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ["1"], action: "Rate Again — back to Sabqi" },
  { keys: ["2"], action: "Rate Hard — short interval" },
  { keys: ["3"], action: "Rate Good — extend interval" },
  { keys: ["4"], action: "Rate Easy — long interval / Manzil push" },
  { keys: ["Space"], action: "Play / pause recitation (continuous mode)" },
  { keys: ["?"], action: "Toggle this help panel" },
];

export function HelpSheet() {
  const open = useReaderStore((s) => s.helpOpen);
  const setOpen = useReaderStore((s) => s.setHelpOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[85vw] sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-amber-600" /> Keyboard shortcuts
          </SheetTitle>
          <SheetDescription>Review faster without leaving the mushaf.</SheetDescription>
        </SheetHeader>
        <ul className="space-y-3 px-1 pb-4">
          {SHORTCUTS.map((s) => (
            <li key={s.keys[0]} className="flex items-start justify-between gap-4">
              <span className="text-sm text-stone-700 dark:text-stone-300">{s.action}</span>
              <kbd className="shrink-0 rounded-md border border-stone-300 bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200">
                {s.keys[0]}
              </kbd>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-2 border-t border-stone-200 pt-4 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
          <p className="flex items-center gap-2">
            <Badge variant="info">Tip</Badge>
            Click any ayah to make it the audio &amp; rating target.
          </p>
          <p className="flex items-center gap-2">
            <Badge variant="warning">WbW</Badge>
            Word-by-word mode plays each word&apos;s own clip in sequence.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
