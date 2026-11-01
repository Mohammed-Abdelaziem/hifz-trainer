"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { Ayah } from "@/types/quran";
import { buildRounds, gradeFor, scoreQuiz } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface QuizModalProps {
  ayahs: Ayah[];
  surahName: string;
  isGuest?: boolean;
  onClose: () => void;
  /** The workspace's flash toast. */
  onResult: (message: string) => void;
  /** Fired after grades were saved so the header chip refreshes. */
  onProgressChange?: () => void;
}

/**
 * Fill-in-the-blank quiz over the bulk selection: one round per verse, one
 * random word blanked, answer from up to four options. At the end the score
 * can be saved straight into the SRS (recalled → GOOD, missed → AGAIN).
 */
export function QuizModal({ ayahs, surahName, isGuest, onClose, onResult, onProgressChange }: QuizModalProps) {
  // Built once per open; re-deriving on every render would reshuffle.
  const rounds = useMemo(() => buildRounds(ayahs, Math.random, { maxRounds: 30 }), [ayahs]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(rounds.length).fill(null));
  const [saving, setSaving] = useState(false);

  const round = rounds[index];
  const chosen = round ? answers[index] : null;
  const score = useMemo(
    () => scoreQuiz(rounds, answers),
    [rounds, answers]
  );
  const finished = !round && rounds.length > 0;

  // Escape closes — the modal sits above everything without a Radix portal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function answer(optionIndex: number) {
    if (chosen !== null) return; // answered rounds are locked until Next
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
  }

  function next() {
    if (index + 1 < rounds.length) {
      setIndex(index + 1);
    } else {
      setIndex(answers.length); // moves past the last round → summary
    }
  }

  async function save() {
    if (saving || finished === false) return;
    setSaving(true);
    try {
      let ok = 0;
      for (const verse of score.verses) {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseKey: verse.verseKey, grade: gradeFor(verse) }),
        });
        if (res.ok) ok += 1;
      }
      if (ok === score.total) {
        onResult(`Quiz saved — ${score.correct}/${score.total} recalled went to the SRS`);
      } else {
        onResult(`Quiz saved ${ok} of ${score.total} reviews — try again for the rest`);
      }
      if (ok > 0) onProgressChange?.();
      onClose();
    } catch {
      onResult("Could not reach the server — quiz results kept on screen");
    } finally {
      setSaving(false);
    }
  }

  if (rounds.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-stone-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Quiz — {surahName}</h2>
            <Button size="icon" variant="ghost" aria-label="Close quiz" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
            None of the selected verses has enough words to build a question.
          </p>
        </div>
      </div>
    );
  }

  const answered = answers.filter((a) => a !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quiz on ${surahName}`}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Quiz — {surahName}</h2>
          <Button size="icon" variant="ghost" aria-label="Close quiz" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!finished && round ? (
          <>
            <div className="mt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>
                Round {answered + (chosen === null ? 1 : 0)} of {rounds.length}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Which word is missing?
              </span>
            </div>

            <p dir="rtl" lang="ar" className="mt-4 text-right text-2xl leading-[2.3]">
              {round.words.map((word, i) =>
                i === round.blankIndex ? (
                  <span
                    key={word.id}
                    aria-label="missing word"
                    className="mx-[0.12em] inline-block w-16 rounded-md border-b-2 border-amber-500 align-middle"
                  >
                    {chosen !== null ? (
                      <span
                        className={cn(
                          "text-base",
                          chosen === round.correctIndex ? "text-emerald-600" : "text-red-600"
                        )}
                      >
                        {round.options[chosen]}
                      </span>
                    ) : (
                      <span className="text-stone-400">ـــ</span>
                    )}
                  </span>
                ) : (
                  <span key={word.id} className="mx-[0.12em]">
                    {word.text_uthmani}
                  </span>
                )
              )}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {round.options.map((option, i) => {
                const isCorrect = i === round.correctIndex;
                const isChosen = i === chosen;
                return (
                  <button
                    key={`${option}-${i}`}
                    type="button"
                    dir="rtl"
                    onClick={() => answer(i)}
                    className={cn(
                      "cursor-pointer rounded-lg border px-3 py-2 text-lg transition-colors",
                      chosen === null
                        ? "border-stone-200 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
                        : isCorrect
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                          : isChosen
                            ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
                            : "border-stone-200 opacity-50 dark:border-stone-700"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Verse {round.ayahNumber}
              </span>
              <Button size="sm" onClick={next} disabled={chosen === null}>
                {index + 1 < rounds.length ? "Next" : "Finish"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
              {score.correct} of {score.total} recalled
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {score.verses.map((v) => (
                <div
                  key={v.verseKey}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
                    v.correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                  )}
                >
                  {v.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span className="truncate">{v.verseKey}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close
              </Button>
              {isGuest ? (
                <span className="self-center text-xs text-stone-500 dark:text-stone-400">
                  Sign in to save these results to the SRS
                </span>
              ) : (
                <Button size="sm" onClick={() => void save()} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save to SRS ({score.correct} good · {score.total - score.correct} again)
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
