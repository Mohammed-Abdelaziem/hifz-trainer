import type { Metadata } from "next";
import { MushafGrid } from "@/components/analytics/MushafGrid";
import { ReviewActivity } from "@/components/analytics/ReviewActivity";
import { SchedulerCompare } from "@/components/analytics/SchedulerCompare";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

export const metadata: Metadata = {
  title: "Memory Heatmap — Hifz Trainer",
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
