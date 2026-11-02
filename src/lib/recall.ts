import type { Ayah } from "@/types/quran";

/**
 * Recall-drill logic, pure and test-first like src/lib/quiz.ts.
 *
 * Two drills test the two hifz failure modes that masking alone cannot:
 *
 *  1. "Word by word" — the user recites a single ayah from memory while the
 *     UI shows only first-letter prompts; every tapped slot reveals one
 *     word. Scoring is self-assessment, mapped onto SRS grades.
 *  2. "What comes next?" — continuity. The UI shows the END of ayah N and
 *     four candidate OPENINGS for ayah N+1 (one correct, drawn from the
 *     rest of the selection). Fluent single-verse recitation tends to
 *     break at verse boundaries; this drill targets exactly that seam.
 */

/** Same shape the shared masking already uses for hidden-word prompts. */
export function firstPrompt(text: string): string {
  const chars = Array.from(text);
  const first = chars[0];
  const tatweelCount = Math.max(1, Math.min(4, Math.floor(chars.length / 3)));
  return first + "ـ".repeat(tatweelCount);
}

export interface WordSlot {
  wordId: string;
  prompt: string;
  /** Only in build output for tests/ARIA — never rendered before reveal. */
  text: string;
}

export function buildWordSlots(ayah: Ayah): WordSlot[] {
  return ayah.words.map((word) => ({
    wordId: word.id,
    prompt: firstPrompt(word.text_uthmani),
    text: word.text_uthmani,
  }));
}

/** Self-assessment → SRS grade, mirroring quiz.ts's recall/missed mapping. */
export const SELF_ASSESSMENTS = [
  { id: "perfect", label: "Recited perfectly", grade: "GOOD" },
  { id: "slips", label: "Slipped a few times", grade: "HARD" },
  { id: "forgot", label: "Forgot most of it", grade: "AGAIN" },
] as const;

export type SelfAssessmentId = (typeof SELF_ASSESSMENTS)[number]["id"];

export function gradeForSelfAssessment(id: SelfAssessmentId): string {
  return SELF_ASSESSMENTS.find((a) => a.id === id)?.grade ?? "AGAIN";
}

/** Words of the opening sequence shown as an answer option. */
const HEAD_WORDS = 4;
/** Words of ayah N's tail shown as the prompt. */
const TAIL_WORDS = 3;
/** A 3-char minimum, like quiz.ts: particles make noisy options. */
const MIN_WORD_CHARS = 3;

export interface PredictionRound {
  /** Index of ayah N (the prompt); the answer is the opening of N+1. */
  ayahIndex: number;
  promptVerseKey: string;
  promptNumber: number;
  /** Last `TAIL_WORDS` texts of ayah N, in order, for a right-to-left tail. */
  tail: string[];
  options: string[];
  correctIndex: number;
  answerVerseKey: string;
  answerNumber: number;
}

function opening(ayah: Ayah, headWords: number): string | null {
  const words = ayah.words.filter((w) => w.text_uthmani.trim().length >= MIN_WORD_CHARS);
  if (words.length < headWords) return null;
  return words
    .slice(0, headWords)
    .map((w) => w.text_uthmani)
    .join(" ");
}

function tail(ayah: Ayah, tailWords: number): string[] {
  const filled = ayah.words.filter((w) => w.text_uthmani.trim().length >= MIN_WORD_CHARS);
  const source = filled.length >= tailWords ? filled : ayah.words;
  return source.slice(-tailWords).map((w) => w.text_uthmani);
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * One round per consecutive surah seam: ayah N's tail against ayah N+1's
 * opening. Distractors are openings of other verses in the same surah, so
 * a wrong pick still sounds "close" — harder than random vocabulary noise.
 * A verse whose opening is too short for options is skipped (the seam that
 * uses it stops being tested, like quiz verses with no eligible words).
 */
export function buildPredictionRounds(
  ayahs: Ayah[],
  rng: () => number = Math.random,
  opts: { maxRounds?: number } = {}
): PredictionRound[] {
  if (ayahs.length < 2) return [];

  // Openings are reused as distractors; distinct openings keep every set of
  // options honest (no two identical answers in one round).
  const openingsByIndex = new Map<number, string>();
  ayahs.forEach((ayah, index) => {
    const op = opening(ayah, HEAD_WORDS);
    if (op && op.trim().length > 0) openingsByIndex.set(index, op);
  });

  const seams: PredictionRound[] = [];
  for (let i = 0; i + 1 < ayahs.length; i++) {
    const correct = openingsByIndex.get(i + 1);
    if (correct === undefined) continue;

    const distractorPool = [...openingsByIndex.entries()]
      .filter(([idx, op]) => idx !== i + 1 && op !== correct)
      .map(([, op]) => op);
    if (distractorPool.length < 1) continue;

    const uniqueDistractors = [...new Set(distractorPool)].slice(0, 3);
    const options = shuffle([correct, ...uniqueDistractors], rng);
    const correctIndex = options.indexOf(correct);
    if (correctIndex < 0) continue;

    seams.push({
      ayahIndex: i,
      promptVerseKey: ayahs[i].verse_key,
      promptNumber: ayahs[i].ayah_number,
      tail: tail(ayahs[i], TAIL_WORDS),
      options,
      correctIndex,
      answerVerseKey: ayahs[i + 1].verse_key,
      answerNumber: ayahs[i + 1].ayah_number,
    });
  }

  const maxRounds = opts.maxRounds ?? 0;
  if (maxRounds > 0 && maxRounds < seams.length) {
    return shuffle(seams, rng).slice(0, maxRounds).sort((a, b) => a.ayahIndex - b.ayahIndex);
  }
  return seams;
}

export interface PredictionVerseResult {
  verseKey: string;
  correct: boolean;
}

/** Grades each ANSWERED round's target ayah; skipped rounds are ignored. */
export function gradeRounds(
  rounds: PredictionRound[],
  answers: (number | null)[]
): PredictionVerseResult[] {
  const out: PredictionVerseResult[] = [];
  rounds.forEach((round, i) => {
    const answer = answers[i];
    if (answer === null || answer === undefined) return;
    out.push({
      verseKey: round.answerVerseKey,
      correct: answer === round.correctIndex,
    });
  });
  return out;
}
