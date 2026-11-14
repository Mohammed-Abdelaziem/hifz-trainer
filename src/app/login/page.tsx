import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarCheck2, Flame, Map, ShieldCheck } from "lucide-react";
import { getSessionUser } from "@/lib/server/auth";
import { AuthForms } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to Wholly Quran to track your Quran memorization progress, review schedules, and analytics.",
  robots: { index: false },
};

const PREVIEW_CELLS = [
  "#0d9488", "#0d9488", "#0d9488", "#2dd4bf", "#16a34a", "#16a34a", "#f59e0b", "#16a34a",
  "#0d9488", "#2dd4bf", "#16a34a", "#f59e0b", "#f97316", "#16a34a", "#2dd4bf", "#d6d3d1",
  "#16a34a", "#f59e0b", "#ef4444", "#d6d3d1", "#0d9488", "#16a34a", "#bae6fd", "#d6d3d1",
];

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10 sm:py-14">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
        {/* Left: Auth */}
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="mb-6">
            <div className="flex items-center gap-2.5">
              <span
                dir="rtl"
                lang="ar"
                className="font-quran text-4xl leading-none text-amber-700 dark:text-amber-400"
              >
                حِفْظ
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                Hifz Trainer
              </h1>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Never lose a surah you&apos;ve memorized. Sync your daily Sabaq, Sabqi, Manzil, and
              periodic revision across devices.
            </p>
          </div>

          <AuthForms />
        </div>

        {/* Right: Product Value Showcase */}
        <div className="hidden rounded-2xl border border-stone-800 bg-stone-900 p-7 text-stone-100 shadow-xl lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            What unlocks with your free account
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
            One calm system for lifelong Quran retention
          </h2>

          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400">
                <Map className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white">114-Surah &amp; 604-Page Heatmap</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
                  See strong, fading, and partially memorized surahs at a glance.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <CalendarCheck2 className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white">Periodic Revision for Known Surahs</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
                  Mark surahs you already know and get gentle 14-day+ check-in reminders.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white">Offline Queue &amp; Streak Freeze</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
                  Review even without signal — grades sync automatically when you&apos;re back online.
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-7 rounded-xl border border-stone-800 bg-stone-950/70 p-4">
            <div className="mb-2.5 flex items-center justify-between text-[11px] text-stone-400">
              <span>Mushaf Stability Preview</span>
              <span className="inline-flex items-center gap-1 text-teal-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Free forever
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5" aria-hidden="true">
              {PREVIEW_CELLS.map((color, i) => (
                <span key={i} className="h-3.5 rounded-[3px]" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
