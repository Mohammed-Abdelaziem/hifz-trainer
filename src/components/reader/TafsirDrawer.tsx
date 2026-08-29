"use client";

import { BookOpenText } from "lucide-react";
import type { Ayah } from "@/types/quran";
import { useReaderStore } from "@/stores/reader-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function TafsirDrawer({ ayah }: { ayah: Ayah }) {
  const open = useReaderStore((s) => s.tafsirOpen);
  const setOpen = useReaderStore((s) => s.setTafsirOpen);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open tafsir panel"
        className="fixed bottom-32 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg transition-transform hover:scale-105 dark:bg-amber-600 cursor-pointer"
      >
        <BookOpenText className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full overflow-y-auto p-0 sm:max-w-md">
          <SheetHeader className="border-b border-stone-200 p-5 dark:border-stone-800">
            <SheetTitle>Tafsir — Ayah {ayah.verse_key}</SheetTitle>
            <SheetDescription>Study aids for the selected verse</SheetDescription>
          </SheetHeader>

          <div dir="rtl" lang="ar" className="font-quran px-6 pt-6 text-2xl leading-[2.2] text-stone-900 dark:text-stone-100">
            {ayah.words.map((w) => w.text_uthmani).join(" ")}
          </div>

          <div className="space-y-6 p-6 text-sm">
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                Tafsir (Ibn Kathir, summarized)
              </h4>
              {ayah.tafsir ? (
                <p className="leading-relaxed text-stone-700 dark:text-stone-300">{ayah.tafsir}</p>
              ) : (
                <p className="text-sm leading-relaxed text-stone-400 dark:text-stone-500 italic">
                  Tafsir hasn&apos;t been loaded for this verse yet. Open it while online to
                  fetch the Ibn Kathir (abridged) commentary.
                </p>
              )}
            </section>

            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                Word study
              </h4>
              <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-700">
                {ayah.words.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-baseline justify-between gap-4 px-3 py-2"
                  >
                    <span dir="rtl" lang="ar" className="font-quran text-xl">
                      {w.text_uthmani}
                    </span>
                    <span className="text-right">
                      <span className="block text-xs text-stone-600 dark:text-stone-300">{w.translation}</span>
                      {w.transliteration && (
                        <span dir="ltr" className="block text-[11px] italic text-sky-700 dark:text-sky-400">
                          {w.transliteration}
                        </span>
                      )}
                      {w.root && (
                        <span dir="rtl" className="block text-[11px] text-emerald-700 dark:text-emerald-400">
                          root: {w.root}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
