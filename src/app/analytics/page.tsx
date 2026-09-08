import type { Metadata } from "next";
import { MushafGrid } from "@/components/analytics/MushafGrid";
import { ReviewActivity } from "@/components/analytics/ReviewActivity";
import { SchedulerCompare } from "@/components/analytics/SchedulerCompare";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

export const metadata: Metadata = {
  title: "Memory Heatmap — Track Your Quran Memorization Progress",
  description:
    "Visualize your Quran memorization strength with an interactive mushaf heatmap. Track review activity, compare SM2 vs FSRS schedulers, and monitor long-term retention.",
  keywords: [
    "quran memorization tracker",
    "hifz progress heatmap",
    "quran review analytics",
    "spaced repetition stats",
  ],
  openGraph: {
    title: "Quran Memorization Heatmap — Wholly Quran",
    description:
      "Interactive heatmap showing your Quran memorization strength across all 114 surahs.",
    url: "https://whollyquran.com/analytics",
  },
};

export default async function AnalyticsPage() {
  const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
  const isGuest = !user && guest;
  return (
    <div className="mx-auto max-w-5xl flex-1 space-y-6 px-4 py-8">
      <header className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mushaf heatmap</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
          {isGuest
            ? "Sign in to track your memorization progress across the Quran."
            : "Real-time memory stability across the whole Quran. Color encodes recall strength (interval-based, decayed when overdue); outlined red cells are decaying fastest. Tap a colored cell to open it in the reader."}
        </p>
      </header>
      {isGuest ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-700">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Create an account or sign in to see your memory heatmap and review analytics.
          </p>
        </div>
      ) : (
        <>
          <MushafGrid />
          <ReviewActivity />
          <SchedulerCompare />
        </>
      )}
    </div>
  );
}
