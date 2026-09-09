"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, ArrowRight } from "lucide-react";
import type { DailyQueue, QueueItem } from "@/types/srs";
import { cn, formatDueIn } from "@/lib/utils";

type Bucket = "sabaq" | "sabqi" | "manzil";

const TABS: {
  key: Bucket;
  label: string;
  arabic: string;
  description: string;
  detail: string;
  accent: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    key: "sabaq",
    label: "Sabaq",
    arabic: "سَبَق",
    description: "New memorisation",
    detail: "Verses you're learning for the first time or re-learning after forgetting. Start here every session.",
    accent: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800/60",
  },
  {
    key: "sabqi",
    label: "Sabqi",
    arabic: "سَبْقِي",
    description: "Recent review",
    detail: "Verses memorised in the last 7–14 days. Quick daily check to strengthen fresh memory before it fades.",
    accent: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800/60",
  },
  {
    key: "manzil",
    label: "Manzil",
    arabic: "مَنْزِل",
    description: "Long-term rotation",
    detail: "Verses you already know well. Spaced review every few weeks to keep them strong long-term.",
    accent: "text-sky-700 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/20",
    borderColor: "border-sky-200 dark:border-sky-800/60",
  },
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
  const [active, setActive] = useState<Bucket>("sabaq");
  const counts: Record<Bucket, number> = {
    sabaq: queue.sabaq.length,
    sabqi: queue.sabqi.length,
    manzil: queue.manzil.length,
  };
  const items = queue[active];
  const meta = TABS.find((t) => t.key === active)!;

  return (
    <section>
      {/* Flow indicator */}
      <div className="mb-4 flex items-center justify-center gap-1 text-[11px] text-stone-400 dark:text-stone-500">
        {TABS.map((t, i) => (
          <span key={t.key} className="flex items-center gap-1">
            <span className={cn("font-medium", t.accent)}>{t.label}</span>
            {i < TABS.length - 1 && <ArrowRight className="h-3 w-3" />}
          </span>
        ))}
        <span className="ml-1">— verses flow from left to right as they strengthen</span>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            aria-selected={active === t.key}
            role="tab"
            className={cn(
              "cursor-pointer rounded-xl border px-4 py-2.5 text-left transition-all",
              active === t.key
                ? cn("shadow-sm", t.bgColor, t.borderColor)
                : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
            )}
          >
            <span className="flex items-center gap-2">
              <span className={cn("text-sm font-semibold", active === t.key ? t.accent : "text-stone-700 dark:text-stone-200")}>
                {t.label}
              </span>
              <span className="font-quran text-xs text-stone-400 dark:text-stone-500" dir="rtl">
                {t.arabic}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  counts[t.key] > 0
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                )}
              >
                {counts[t.key]}
              </span>
            </span>
            {active === t.key && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {t.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Detail card */}
      <div className={cn("rounded-xl border p-4 shadow-sm dark:bg-stone-900", meta.borderColor, meta.bgColor)}>
        <div className="mb-2 flex items-baseline gap-2">
          <span className={cn("font-quran text-lg", meta.accent)} dir="rtl">
            {meta.arabic}
          </span>
          <span className={cn("text-sm font-semibold", meta.accent)}>
            {meta.label} — {meta.description}
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {meta.detail}
        </p>
      </div>

      {/* Queue list */}
      <div className="mt-3 min-h-[120px] rounded-xl border border-stone-200 bg-white p-2 shadow-sm dark:border-stone-800 dark:bg-stone-900">
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
                  {active === "sabaq" && "No new verses to learn right now. Great job staying on top!"}
                  {active === "sabqi" && "No recent verses due for review. They'll appear here as you memorise new ones."}
                  {active === "manzil" && "No long-term verses due. They'll appear here as your sabqi verses mature."}
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
