import type { Metadata } from "next";
import { MushafGrid } from "@/components/analytics/MushafGrid";
import { ReviewActivity } from "@/components/analytics/ReviewActivity";
import { SchedulerCompare } from "@/components/analytics/SchedulerCompare";
import { requirePageUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Memory Heatmap — Hifz Trainer",
};

export default async function AnalyticsPage() {
  await requirePageUser();
  return (
    <div className="mx-auto max-w-5xl flex-1 space-y-6 px-4 py-8">
      <header className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mushaf heatmap</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
          Real-time memory stability across the whole Quran. Color encodes recall strength
          (interval-based, decayed when overdue); outlined red cells are decaying fastest. Tap a
          colored cell to open it in the reader.
        </p>
      </header>
      <MushafGrid />
      <ReviewActivity />
      <SchedulerCompare />
    </div>
  );
}
