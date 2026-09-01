"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Headphones, Brain, BarChart3, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: BookOpen,
    title: "Welcome to Hifz Trainer",
    description: "Your personal Quran companion for reading, memorizing, and tracking your journey.",
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Headphones,
    title: "Read & Listen",
    description: "Browse the full Quran with multiple reciters. Tap any verse to play audio with word-by-word highlighting.",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Brain,
    title: "Memorize with Spaced Repetition",
    description: "Use Sabaq, Sabqi, and Manzil buckets to memorize efficiently. Masking modes help you test recall at every step.",
    accent: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description: "See your memory heatmap, daily streaks, and review activity. Know exactly where you stand across all 114 surahs.",
    accent: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Sparkles,
    title: "You're All Set!",
    description: "Start reading, set your daily goal, and build your hifz journey. We're here to support you every step of the way.",
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export function OnboardingTour() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboardingStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    useOnboardingStore.persist.rehydrate();
  }, []);

  if (hasCompletedOnboarding) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  function goNext() {
    if (isLast) {
      completeOnboarding();
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function goPrev() {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  function skip() {
    completeOnboarding();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      <div className="relative w-[90vw] max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-stone-700 dark:bg-stone-900">
        <button
          onClick={skip}
          aria-label="Skip onboarding"
          className="absolute right-4 top-4 text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
        >
          Skip
        </button>

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className={cn("mb-5 flex h-20 w-20 items-center justify-center rounded-full", current.bg)}>
                <Icon className={cn("h-10 w-10", current.accent)} />
              </div>
              <h2 className="mb-2 text-xl font-bold text-stone-900 dark:text-stone-50">
                {current.title}
              </h2>
              <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              step === 0
                ? "text-stone-300 dark:text-stone-600"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            )}
          >
            Previous
          </button>

          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-6 bg-amber-600 dark:bg-amber-400"
                    : "w-1.5 bg-stone-200 dark:bg-stone-700"
                )}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer"
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
