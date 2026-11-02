import { describe, expect, it } from "vitest";
import {
  buildPredictionRounds,
  buildWordSlots,
  gradeForSelfAssessment,
  gradeRounds,
  firstPrompt,
  type PredictionRound,
} from "../recall";
import type { Ayah } from "@/types/quran";

function ayah(n: number, words: string[]): Ayah {
  return {
    ayah_number: n,
    verse_key: `1:${n}`,
    words: words.map((t, i) => ({ id: `1:${n}:${i + 1}`, text_uthmani: t, translation: "" })),
    audio_url: "x",
    timings: [],
    tafsir: "",
    translation: "",
  };
}

describe("firstPrompt", () => {
  it("keeps the first letter plus a tatweel pad", () => {
    const prompt = firstPrompt("ٱلْحَمْدُ");
    expect(prompt.startsWith("ٱ")).toBe(true);
    expect(prompt.length).toBeGreaterThan(1);
    expect(prompt).not.toContain("ح");
  });
});

describe("buildWordSlots", () => {
  it("maps every word to a prompt without leaking the full text", () => {
    const first = ayah(1, ["ٱلْحَمْدُ", "لِلَّهِ"]);
    const slots = buildWordSlots(first);
    expect(slots).toHaveLength(2);
    expect(slots[0].prompt.startsWith("ٱ")).toBe(true);
    expect(slots[0].text).toBe("ٱلْحَمْدُ");
  });
});

describe("gradeForSelfAssessment", () => {
  it("maps perfect→GOOD, slips→HARD, forgot→AGAIN", () => {
    expect(gradeForSelfAssessment("perfect")).toBe("GOOD");
    expect(gradeForSelfAssessment("slips")).toBe("HARD");
    expect(gradeForSelfAssessment("forgot")).toBe("AGAIN");
  });
});

describe("buildPredictionRounds", () => {
  const ayahs = [
    ayah(1, ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ", "خِتَام"]),
    ayah(2, ["ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ", "مَٰلِكِ", "يَوْمِ", "ٱلدِّينِ", "خِتَام"]),
    ayah(3, ["إِيَّاكَ", "نَعْبُدُ", "وَإِيَّاكَ", "نَسْتَعِينُ", "خَتْم"]),
  ];

  it("builds one round per seam with distinct options", () => {
    const rng = () => 0; // deterministic
    const rounds = buildPredictionRounds(ayahs, rng);
    expect(rounds).toHaveLength(2);
    for (const r of rounds) {
      expect(new Set(r.options).size).toBe(r.options.length);
      expect(r.options.length).toBeGreaterThanOrEqual(2);
      expect(r.options).toContain(ayahs[r.ayahIndex + 1].words.slice(0, 4).map((w) => w.text_uthmani).join(" "));
    }
  });

  it("tail shows the prompt ayah's last words", () => {
    const rounds = buildPredictionRounds(ayahs, () => 0);
    expect(rounds[0].tail).toEqual(["رَبِّ", "ٱلْعَٰلَمِينَ", "خِتَام"]);
  });

  it("skips when no correct opening or no distractors exist", () => {
    const single = [ayah(1, ["وَالْعَصْرِ"])];
    expect(buildPredictionRounds(single)).toHaveLength(0);
    expect(buildPredictionRounds([])).toHaveLength(0);
  });

  it("caps rounds to maxRounds and keeps surah order", () => {
    const many: Ayah[] = [];
    for (let i = 1; i <= 40; i++) {
      many.push(ayah(i, [`كَلِمَة${i}`, "ثَانِيَةٌ", "ثَالِثَةٌ", "رَابِعَةٌ", "خِتَام"]));
    }
    const rounds = buildPredictionRounds(many, Math.random, { maxRounds: 5 });
    expect(rounds).toHaveLength(5);
    for (let i = 1; i < rounds.length; i++) {
      expect(rounds[i].ayahIndex).toBeGreaterThan(rounds[i - 1].ayahIndex);
    }
  });

  it("is deterministic for a fixed rng", () => {
    const rng = () => 0.42;
    expect(buildPredictionRounds(ayahs, rng)).toEqual(buildPredictionRounds(ayahs, rng));
  });
});

describe("gradeRounds", () => {
  const rounds: PredictionRound[] = [
    {
      ayahIndex: 0,
      promptVerseKey: "1:1",
      promptNumber: 1,
      tail: ["خِتَام"],
      options: ["a", "b", "c"],
      correctIndex: 1,
      answerVerseKey: "1:2",
      answerNumber: 2,
    },
    {
      ayahIndex: 1,
      promptVerseKey: "1:2",
      promptNumber: 2,
      tail: ["خَتْم"],
      options: ["x", "y"],
      correctIndex: 0,
      answerVerseKey: "1:3",
      answerNumber: 3,
    },
  ];

  it("grades answered rounds only, keyed on the ayah that must follow", () => {
    expect(gradeRounds(rounds, [1, null])).toEqual([{ verseKey: "1:2", correct: true }]);
    expect(gradeRounds(rounds, [0, 0])).toEqual([
      { verseKey: "1:2", correct: false },
      { verseKey: "1:3", correct: true },
    ]);
  });
});
