"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import type { Ayah } from "@/types/quran";
import {
  SELF_ASSESSMENTS,
  buildPredictionRounds,
  buildWordSlots,
  gradeForSelfAssessment,
  gradeRounds,
  type SelfAssessmentId,
} from "@/lib/recall";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecallDrillModalProps {
  ayahs: Ayah[];
  surahName: string;
  /** The verse the user had focused when opening the drill. */
  focusVerseKey: string;
  isGuest?: boolean;
  onClose: () => void;
  onResult: (message: string) => void;
  onProgressChange?: () => void;
}

/**
 * Active-recall drills over the open surah (see src/lib/recall.ts):
 * "Word by word" self-checks the focused ayah against first-letter prompts;
 * "What's next?" quizzes continuity at verse seams. Both end in SRS grades
 * (precedent: QuizModal — saved reviews follow the same endpoint contract).
 */
export function RecallDrillModal({
  ayahs,
  surahName,
  focusVerseKey,
  isGuest,
  onClose,
  onResult,
  onProgressChange,
}: RecallDrillModalProps) {
  const [tab, setTab] = useState<"words" | "next">("words");
  const focusAyah = ayahs.find((a) => a.verse_key === focusVerseKey) ?? ayahs[0];

  // word-by-word state
  const slots = useMemo(() => (focusAyah ? buildWordSlots(focusAyah) : []), [focusAyah]);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [selfGrade, setSelfGrade] = useState<SelfAssessmentId | null>(null);
  const [savingWord, setSavingWord] = useState(false);

  // prediction state
  const rounds = useMemo(() => buildPredictionRounds(ayahs, Math.random, { maxRounds: 20 }), [ayahs]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(rounds.length).fill(null));
  const [savingRounds, setSavingRounds] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset the word-drill state when the focused ayah changes. Done during
  // render (react-hooks/set-state-in-effect bans direct setState in effects).
  const focusKey = focusAyah?.verse_key ?? "";
  const [lastFocusKey, setLastFocusKey] = useState(focusKey);
  if (focusKey !== lastFocusKey) {
    setLastFocusKey(focusKey);
    setRevealed(new Set());
    setSelfGrade(null);
  }
  const round = roundIndex < rounds.length ? rounds[roundIndex] : null;
  const chosen = round ? answers[roundIndex] : null;
  const predictionDone = !round && rounds.length > 0;

  const scored = useMemo(() => gradeRounds(rounds, answers), [rounds, answers]);

  async function saveSelfGrade(id: SelfAssessmentId) {
    if (savingWord || !focusAyah) return;
    setSelfGrade(id);
    if (isGuest) {
      onResult("Drill attempted — sign in to save this verse to your SRS");
      return;
    }
    setSavingWord(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseKey: focusAyah.verse_key, grade: gradeForSelfAssessment(id) }),
      });
      if (res.ok) {
        onResult("Recall drill saved to your SRS");
        onProgressChange?.();
      } else {
        onResult("Recall drill finished, but the review could not be saved");
      }
    } catch {
      onResult("Recall drill finished offline — result not saved");
    } finally {
      setSavingWord(false);
    }
  }

  function answerRound(optionIndex: number) {
    if (chosen !== null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[roundIndex] = optionIndex;
      return next;
    });
  }

  function nextRound() {
    if (roundIndex + 1 < rounds.length) setRoundIndex(roundIndex + 1);
    else setRoundIndex(rounds.length);
  }

  async function savePrediction() {
    if (savingRounds || !predictionDone) return;
    setSavingRounds(true);
    try {
      if (isGuest) {
        onResult("Prediction run finished — sign in to save it to your SRS");
      } else {
        let ok = 0;
        for (const verse of scored) {
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verseKey: verse.verseKey, grade: verse.correct ? "GOOD" : "AGAIN" }),
          });
          if (res.ok) ok += 1;
        }
        const correct = scored.filter((v) => v.correct).length;
        if (ok === scored.length && scored.length > 0) {
          onResult(`Predictions saved — ${correct}/${scored.length} went to the SRS`);
          onProgressChange?.();
        } else {
          onResult(`Saved ${ok} of ${scored.length} predictions — try again for the rest`);
        }
      }
      onClose();
    } catch {
      onResult("Could not reach the server — drill results kept on screen");
    } finally {
      setSavingRounds(false);
    }
  }

  const revealedCount = revealed.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Recall drill — ${surahName}`}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-stone-900 dark:text-stone-100">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Recall drill
          </h2>
          <Button size="icon" variant="ghost" aria-label="Close drill" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex gap-2" role="tablist" aria-label="Drill type">
          {(
            [
              { id: "words", label: "Word by word" },
              { id: "next", label: "What comes next?" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                tab === t.id
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300"
                  : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "words" ? (
          <div className="mt-4">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ayah {focusAyah?.ayah_number} — recite from memory, THEN tap each slot to verify against
              the first-letter prompt.
            </p>
            <div dir="rtl" lang="ar" className="mt-3 flex flex-wrap gap-1.5">
              {slots.map((slot) => {
                const isRevealed = revealed.has(slot.wordId);
                return (
                  <button
                    key={slot.wordId}
                    aria-label={isRevealed ? `Word: ${slot.text}` : "Reveal word"}
                    onClick={() =>
                      setRevealed((prev) => {
                        const next = new Set(prev);
                        next.add(slot.wordId);
                        return next;
                      })
                    }
                    className={cn(
                      "font-quran text-xl leading-relaxed transition-colors",
                      isRevealed
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-amber-700/80 hover:text-amber-700 dark:text-amber-300/70 dark:hover:text-amber-300 cursor-pointer"
                    )}
                  >
                    {isRevealed ? slot.text : slot.prompt}
                  </button>
                );
              })}
            </div>

            {revealedCount === slots.length && slots.length > 0 && !selfGrade && (
              <div className="mt-4 rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  How did that recitation go?
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {SELF_ASSESSMENTS.map((a) => (
                    <Button
                      key={a.id}
                      variant="outline"
                      size="sm"
                      disabled={savingWord}
                      onClick={() => saveSelfGrade(a.id)}
                      className="justify-start"
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
                {isGuest && (
                  <p className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
                    Guests drill freely; grades are saved only for signed-in accounts.
                  </p>
                )}
              </div>
            )}

            {selfGrade && (
              <div className="mt-4 flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300">
                <Check className="h-4 w-4" />
                Self-assessed — {SELF_ASSESSMENTS.find((a) => a.id === selfGrade)?.label}.
                {isGuest ? "Sign in to save grades." : "Saved to your SRS queue."}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {rounds.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                This surah is too short for a continuity drill.
              </p>
            ) : round ? (
              <>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {round.promptNumber === round.answerNumber - 1
                    ? `Ayah ${round.promptNumber} ends with…`
                    : `Skipping ahead: ayah ${round.promptNumber} ends with…`}{" "}
                  what opens ayah {round.answerNumber}?
                </p>
                <p dir="rtl" lang="ar" className="mt-2 font-quran text-2xl leading-relaxed text-stone-800 dark:text-stone-200">
                  {round.tail.join(" ")} …
                </p>
                <div className="mt-4 grid gap-2" role="group" aria-label="Answer options">
                  {round.options.map((option, i) => {
                    const isCorrect = i === round.correctIndex;
                    const isChosen = chosen === i;
                    return (
                      <button
                        key={i}
                        dir="rtl"
                        lang="ar"
                        disabled={chosen !== null}
                        onClick={() => answerRound(i)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 font-quran text-xl leading-relaxed text-right transition-colors",
                          chosen === null
                            ? "border-stone-300 text-stone-800 hover:border-amber-500 hover:bg-amber-50 cursor-pointer dark:border-stone-600 dark:text-stone-200 dark:hover:bg-amber-500/10"
                            : isCorrect
                              ? "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                              : isChosen
                                ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                : "border-stone-200 text-stone-400 dark:border-stone-700 dark:text-stone-500"
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {chosen !== null && (
                  <Button className="mt-4 w-full" onClick={nextRound}>
                    {roundIndex + 1 < rounds.length ? "Next seam" : "See results"}
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="rounded-lg bg-stone-100 p-4 text-center dark:bg-stone-800">
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    {scored.filter((v) => v.correct).length}/{scored.length} seams correct
                  </p>
                </div>
                <Button className="mt-4 w-full" onClick={savePrediction} disabled={savingRounds}>
                  {savingRounds ? <Loader2 className="h-4 w-4 animate-spin" /> : isGuest ? "Done" : "Save to SRS"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
