import { describe, expect, it } from "vitest";
import { buildRounds, gradeFor, scoreQuiz } from "@/lib/quiz";
import type { Ayah, QuranWord } from "@/types/quran";

/** Deterministic LCG so shuffle/blank picks are stable across runs. */
function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function word(id: string, text: string): QuranWord {
  return { id, text_uthmani: text, translation: `translation of ${id}` };
}

function ayah(verseKey: string, texts: string[]): Ayah {
  return {
    ayah_number: Number(verseKey.split(":")[1]),
    verse_key: verseKey,
    words: texts.map((t, i) => word(`${verseKey}#${i}`, t)),
    audio_url: "",
    timings: [],
    tafsir: "",
    translation: "",
  };
}

describe("buildRounds", () => {
  it("makes one round with one blank per verse", () => {
    const ayahs = [ayah("1:1", ["قل", "هو", "الله", "أحد"]), ayah("1:2", ["الحمد", "لله", "رب", "العالمين"])];
    const rounds = buildRounds(ayahs, seededRng(7));
    expect(rounds).toHaveLength(2);
    expect(rounds[0]!.verseKey).toBe("1:1");
    const blank = rounds[0]!.words[rounds[0]!.blankIndex]!;
    // exactly one word of the verse was chosen as the blank
    expect(rounds[0]!.options).toContain(blank.text_uthmani);
    expect(rounds[0]!.options[rounds[0]!.correctIndex]).toBe(blank.text_uthmani);
  });

  it("offers the correct text plus up to three distinct distractors", () => {
    const ayahs = [ayah("1:1", ["قل", "هو", "الله", "أحد"]), ayah("1:2", ["الحمد", "لله", "رب", "العالمين", "نصر"])];
    const round = buildRounds(ayahs, seededRng(1))[0]!;
    expect(round.options.length).toBeGreaterThan(1);
    expect(round.options.length).toBeLessThanOrEqual(4);
    expect(new Set(round.options).size).toBe(round.options.length);
  });

  it("skips verses whose words are all too short to quiz on", () => {
    const rounds = buildRounds([ayah("1:1", ["وَ", "لَا", "بِ"])], seededRng(3));
    expect(rounds).toEqual([]);
  });

  it("samples long selections down to the round cap", () => {
    const ayahs = Array.from({ length: 60 }, (_, i) =>
      ayah(`100:${i + 1}`, ["قال", "الم حدود", "حمد", `كلمة${i}`])
    );
    const rounds = buildRounds(ayahs, seededRng(5), { maxRounds: 30 });
    expect(rounds).toHaveLength(30);
    expect(new Set(rounds.map((r) => r.verseKey)).size).toBe(30);
  });

  it("excludes the correct answer from the distractor pool (no answers twice)", () => {
    const ayahs = [ayah("1:1", ["قل", "هو", "الله", "أحد"])];
    for (let seed = 0; seed < 40; seed++) {
      const round = buildRounds(ayahs, seededRng(seed))[0]!;
      const correct = round.options[round.correctIndex]!;
      expect(round.options.filter((o) => o === correct)).toHaveLength(1);
    }
  });

  it("draws distractors from the whole selection's vocabulary", () => {
    const ayahs = [ayah("1:1", ["قل", "هو", "الله", "أحد"])];
    const round = buildRounds(ayahs, seededRng(9))[0]!;
    // pool = only 1:1's eligible words; the correct text is excluded, the
    // rest of the options must come from the same inventory.
    const eligible = ["هو", "الله", "أحد", "قل"];
    for (const o of round.options) expect(eligible).toContain(o);
  });
});

describe("scoreQuiz", () => {
  const ayahs = [ayah("1:1", ["قل", "هو", "الله", "أحد"]), ayah("1:2", ["الحمد", "لله", "رب", "العالمين"])];
  const rounds = buildRounds(ayahs, seededRng(42));

  it("counts the answered rounds: correct when the right option was picked", () => {
    const chosen = rounds.map((r) => r.correctIndex);
    const score = scoreQuiz(rounds, chosen);
    expect(score.total).toBe(2);
    expect(score.correct).toBe(2);
    expect(score.verses.every((v) => v.correct)).toBe(true);
  });

  it("marks a wrong pick as incorrect for that verse only", () => {
    const wrong = (rounds[0]!.correctIndex + 1) % rounds[0]!.options.length;
    const chosen = [wrong, rounds[1]!.correctIndex];
    const score = scoreQuiz(rounds, chosen);
    expect(score.correct).toBe(1);
    expect(score.verses[0]).toEqual({ verseKey: "1:1", correct: false });
    expect(score.verses[1]).toEqual({ verseKey: "1:2", correct: true });
  });

  it("treats a skipped round as incorrect", () => {
    const score = scoreQuiz(rounds, [null, null]);
    expect(score.correct).toBe(0);
  });
});

describe("gradeFor", () => {
  it("maps recalled verses to GOOD and missed ones to AGAIN", () => {
    expect(gradeFor({ verseKey: "1:1", correct: true })).toBe("GOOD");
    expect(gradeFor({ verseKey: "1:1", correct: false })).toBe("AGAIN");
  });
});
