import type { Ayah, QuranWord } from "@/types/quran";

/**
 * Per-verse fill-in-the-blank quiz logic, kept pure so the rounds, the
 * scoring and the SRS grade mapping can be tested without rendering the UI.
 * A round shows one verse from the bulk selection with one word blanked and
 * offers the correct word plus up to three distractor words.
 */

export interface QuizRound {
  verseKey: string;
  ayahNumber: number;
  /** The verse's words in order; `blankIndex`'s word is the hidden one. */
  words: QuranWord[];
  blankIndex: number;
  /** Uthmani texts to show; the correct answer is at `correctIndex`. */
  options: string[];
  correctIndex: number;
}

export interface QuizVerseResult {
  verseKey: string;
  correct: boolean;
}

export interface QuizScore {
  total: number;
  correct: number;
  verses: QuizVerseResult[];
}

/** A 3-character minimum: single-letter particles ("وَ", "بِ") make noise
 * as both blanks and distractors, without being memory anchors. */
const MIN_WORD_CHARS = 3;

/** How many options a question offers at most (correct + distractors). */
const MAX_OPTIONS = 4;

function eligibleWords(ayah: Ayah): { index: number; word: QuranWord }[] {
  const out: { index: number; word: QuranWord }[] = [];
  ayah.words.forEach((word, index) => {
    if (word.text_uthmani.trim().length >= MIN_WORD_CHARS) out.push({ index, word });
  });
  return out;
}

/**
 * One round per selected verse. A verse without any eligible word (all
 * particles, or missing audio/words data) is skipped silently — better one
 * fewer round than a blanked-out "?" the user cannot answer.
 */
export function buildRounds(
  ayahs: Ayah[],
  rng: () => number = Math.random,
  opts: { maxRounds?: number } = {}
): QuizRound[] {
  // Someone bulk-selecting a whole surah (286 verses) would be quizzing for
  // an hour; sample the selection down to a session-length quiz.
  let selection = ayahs;
  const maxRounds = opts.maxRounds ?? 0;
  if (maxRounds > 0 && maxRounds < selection.length) {
    selection = shuffle(selection, rng).slice(0, maxRounds);
  }

  // Distractor pool: every distinct eligible text across the whole selection,
  // so wrong options are drawn from vocabulary the user is actually studying.
  const distractorPool = new Set<string>();
  for (const ayah of selection) {
    for (const { word } of eligibleWords(ayah)) distractorPool.add(word.text_uthmani);
  }

  const rounds: QuizRound[] = [];
  for (const ayah of selection) {
    const candidates = eligibleWords(ayah);
    if (candidates.length === 0) continue;
    const pick = candidates[Math.floor(rng() * candidates.length)];
    const distractors = [...distractorPool].filter((t) => t !== pick.word.text_uthmani);
    // No distractor at all means the single "option" IS the answer — skip
    // rather than show a one-button question that cannot be missed.
    if (distractors.length < 1) continue;
    const distractorTexts = shuffle(distractors, rng).slice(
      0,
      Math.min(MAX_OPTIONS - 1, distractors.length)
    );
    const options = shuffle([pick.word.text_uthmani, ...distractorTexts], rng);
    rounds.push({
      verseKey: ayah.verse_key,
      ayahNumber: ayah.ayah_number,
      words: ayah.words,
      blankIndex: pick.index,
      options,
      correctIndex: options.indexOf(pick.word.text_uthmani),
    });
  }
  return rounds;
}

/** Fisher-Yates with an injected rng for deterministic tests. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/**
 * Score the whole quiz: `chosen[i]` is the index picked for round i, or null
 * when that round was skipped. Correct = answered the blanked word.
 */
export function scoreQuiz(rounds: QuizRound[], chosen: (number | null)[]): QuizScore {
  const verses: QuizVerseResult[] = rounds.map((round, i) => ({
    verseKey: round.verseKey,
    correct: chosen[i] === round.correctIndex,
  }));
  const correct = verses.filter((v) => v.correct).length;
  return { total: verses.length, correct, verses };
}

/**
 * Quiz → SRS mapping for "save these results": what the user recalled maps
 * to a GOOD review, what they missed maps to AGAIN — exactly what grading
 * those verses by hand would have produced.
 */
export function gradeFor(result: QuizVerseResult): "GOOD" | "AGAIN" {
  return result.correct ? "GOOD" : "AGAIN";
}
