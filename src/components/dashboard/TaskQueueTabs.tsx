"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { DailyQueue, QueueItem } from "@/types/srs";
import { cn, formatDueIn } from "@/lib/utils";

type Bucket = "sabqi" | "sabaq" | "manzil";

const TABS: { key: Bucket; label: string; hint: string; accent: string }[] = [
  { key: "sabqi", label: "Sabqi", hint: "Recent review (7–14 days)", accent: "text-emerald-700 dark:text-emerald-400" },
  { key: "sabaq", label: "Sabaq", hint: "New intake & relearning", accent: "text-amber-700 dark:text-amber-400" },
  { key: "manzil", label: "Manzil", hint: "Long-term rotation", accent: "text-sky-700 dark:text-sky-400" },
];

function QueueRow({ item }: { item: QueueItem }) {
  return (
    <Link
      href={`/reader/${item.surahId}?verse=${item.verseKey}`}
      className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-stone-200 hover:bg-stone-50 dark:hover:border-stone-700 dark:hover:bg-stone-800/60"
    >
      <span className="font-quran text-xl leading-none" dir="rtl" lang="ar">
        ﴿{toArabicAyah(item.ayahNumber)}﴾
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.surahName} <span className="text-stone-400">·</span>{" "}
          <span className="tabular-nums text-stone-500">{item.verseKey}</span>
        </p>
        <p className="text-[11px] text-stone-500">Page {item.pageNumber}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
          item.dueAt && new Date(item.dueAt) < new Date()
            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
        )}
      >
        {formatDueIn(item.dueAt)}
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-stone-600" />
    </Link>
  );
}

function toArabicAyah(n: number): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).split("").map((d) => digits[Number(d)] ?? d).join("");
}

export function TaskQueueTabs({ queue }: { queue: DailyQueue }) {
  const [active, setActive] = useState<Bucket>("sabqi");
  const counts: Record<Bucket, number> = {
    sabqi: queue.sabqi.length,
    sabaq: queue.sabaq.length,
    manzil: queue.manzil.length,
  };
  const items = queue[active];
  const meta = TABS.find((t) => t.key === active)!;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            aria-selected={active === t.key}
            role="tab"
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active === t.key
                ? "border-stone-900 bg-stone-900 text-white dark:border-amber-600 dark:bg-amber-600"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                active === t.key
                  ? "bg-white/20 text-white"
                  : counts[t.key] > 0
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
              )}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
        <span className={cn("ml-auto hidden text-xs font-medium sm:block", meta.accent)}>
          {meta.hint}
        </span>
      </div>

      <div className="min-h-[120px] rounded-xl border border-stone-200 bg-white p-2 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {items.length === 0 ? (
              <div className="flex h-[96px] flex-col items-center justify-center gap-1 text-center">
                <BookOpen className="h-5 w-5 text-stone-300 dark:text-stone-600" />
                <p className="text-sm text-stone-500">
                  Nothing due in {meta.label} — {meta.hint.toLowerCase()}
                </p>
              </div>
            ) : (
              items.map((item) => <QueueRow key={item.verseKey} item={item} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-2 text-right text-xs text-stone-400">
        Estimated session:{" "}
        <strong className="text-stone-600 dark:text-stone-300">
          ~{queue.estimatedMinutes} min
        </strong>{" "}
        for {queue.sabaq.length + queue.sabqi.length + queue.manzil.length} tasks
      </p>
    </section>
  );
}
