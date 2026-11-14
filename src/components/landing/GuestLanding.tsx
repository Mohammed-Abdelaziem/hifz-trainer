"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  Eye,
  EyeOff,
  Flame,
  Layers,
  Map,
  Sparkles,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_WORDS = [
  { id: "w1", ar: "قُلْ", en: "Say," },
  { id: "w2", ar: "هُوَ", en: "He is" },
  { id: "w3", ar: "ٱللَّهُ", en: "Allah," },
  { id: "w4", ar: "أَحَدٌ", en: "[who is] One," },
];

const HEATMAP_SAMPLE = [
  "#0d9488", "#0d9488", "#2dd4bf", "#16a34a", "#16a34a", "#f59e0b",
  "#16a34a", "#2dd4bf", "#f59e0b", "#f97316", "#ef4444", "#d6d3d1",
  "#0d9488", "#16a34a", "#16a34a", "#f59e0b", "#d6d3d1", "#d6d3d1",
  "#2dd4bf", "#f97316", "#16a34a", "#bae6fd", "#d6d3d1", "#d6d3d1",
];

export function GuestLanding() {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set(["w1"]));
  const [demoGraded, setDemoGraded] = useState<string | null>(null);

  const toggleWord = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-gradient-to-b from-amber-50/60 via-white to-white dark:border-stone-800/80 dark:from-stone-950 dark:via-stone-950 dark:to-stone-950">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/90 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              FSRS &amp; SM-2 Spaced Repetition · 114 Surahs · Offline-ready
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.08] dark:text-stone-50">
              Memorize the Quran without losing what you already know.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-400">
              Active-recall reading with word-by-word audio sync, automatic{" "}
              <span className="font-medium text-stone-800 dark:text-stone-200">
                Sabaq, Sabqi &amp; Manzil
              </span>{" "}
              scheduling, and periodic revision tracking for surahs you&apos;ve already memorized.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                Start free — save your progress
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/reader/1"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <BookOpen className="h-4 w-4 text-amber-600" aria-hidden="true" />
                Try live reader
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-600" /> Free forever · no credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-600" /> Mark known surahs in 1 click
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-600" /> Zero ads or distractions
              </span>
            </div>
          </div>

          {/* Interactive Live Product Preview */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg shadow-stone-200/50 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  Interactive Recall Preview · Al-Ikhlas 112:1
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Tap blurred words to test your memory
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBlurEnabled((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                {blurEnabled ? (
                  <>
                    <Eye className="h-3 w-3 text-amber-600" /> Reveal all
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 text-amber-600" /> Blur words
                  </>
                )}
              </button>
            </div>

            <div
              dir="rtl"
              lang="ar"
              className="my-4 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-stone-50 px-4 py-6 dark:bg-stone-950/60"
            >
              {DEMO_WORDS.map((w) => {
                const isVisible = !blurEnabled || revealedIds.has(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWord(w.id)}
                    title={isVisible ? w.en : "Click to reveal"}
                    className={cn(
                      "font-quran cursor-pointer rounded-lg px-2 py-1 text-3xl leading-relaxed transition-all sm:text-4xl",
                      isVisible
                        ? "text-stone-900 dark:text-stone-100"
                        : "select-none text-stone-800 blur-[7px] hover:blur-[4px] dark:text-stone-200"
                    )}
                  >
                    {w.ar}
                  </button>
                );
              })}
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-600/70 text-sm font-semibold text-amber-700 dark:border-amber-500/60 dark:text-amber-400">
                ١
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                {[
                  { label: "Again", hint: "1d", cls: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300" },
                  { label: "Hard", hint: "3d", cls: "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-300" },
                  { label: "Good", hint: "6d", cls: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-300" },
                  { label: "Easy", hint: "14d", cls: "border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-900/60 dark:text-sky-300" },
                ].map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setDemoGraded(`${g.label} · next review in ${g.hint}`)}
                    className={cn(
                      "cursor-pointer rounded-lg border bg-white px-2 py-1.5 text-center transition-colors dark:bg-stone-950",
                      g.cls
                    )}
                  >
                    <span className="block">{g.label}</span>
                    <span className="text-[10px] opacity-70">{g.hint}</span>
                  </button>
                ))}
              </div>

              {demoGraded ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                  <span>Scheduled ({demoGraded})</span>
                  <Link href="/login" className="font-semibold underline">
                    Save to your queue →
                  </Link>
                </div>
              ) : (
                <p className="text-center text-[11px] text-stone-400">
                  Click any grade to see how spaced repetition schedules your next review
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Feature Proof */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-50">
            Built around the way Hifz actually works
          </h2>
          <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            New memorization is only half the battle. Retention happens when Sabaq, Sabqi, Manzil,
            and known surahs stay in one calm daily rhythm.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: 3+1 Loop */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Sabaq → Sabqi → Manzil + Revision
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              Verses automatically graduate from new memorization to recent review and long-term
              rotation. Surahs you already know get gentle periodic revision reminders so nothing
              fades silently.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-medium">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Sabaq
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Sabqi
              </span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                Manzil
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                Known Revision
              </span>
            </div>
          </div>

          {/* Card 2: Heatmap */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400">
              <Map className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              114-Surah &amp; 604-Page Heatmap
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              See your entire Mushaf at a glance. Spot weak pages, partially memorized surahs, and
              long-term stability before memory decays.
            </p>
            <div className="mt-4 grid grid-cols-6 gap-1.5" aria-hidden="true">
              {HEATMAP_SAMPLE.map((color, idx) => (
                <span
                  key={idx}
                  className="h-4 rounded-[3px]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Audio + Offline + Streaks */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
              <Volume2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Word-Synced Audio &amp; Offline Queue
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              Follow word-by-word recitation highlights, run active-recall quizzes, and keep your
              daily streak alive with automatic freeze protection and offline review syncing.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Streak freeze
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarCheck2 className="h-3.5 w-3.5 text-teal-600" /> Periodic checks
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white sm:flex-row sm:items-center sm:p-8 dark:border-stone-800 dark:bg-stone-900">
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Start your daily Hifz plan in 10 seconds.
            </h2>
            <p className="mt-1 text-xs text-stone-300 sm:text-sm">
              Sign in with Google or email to sync your memorization map and daily revision queue.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-amber-500 sm:text-sm"
            >
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/quran"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 px-4 py-2.5 text-xs font-semibold text-stone-200 transition-colors hover:bg-stone-800 sm:text-sm"
            >
              Browse Quran
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
