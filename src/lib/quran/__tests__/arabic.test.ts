import { describe, expect, it } from "vitest";
import { normalizeArabic, escapeLikePattern } from "@/lib/quran/arabic";

describe("normalizeArabic", () => {
  it("strips harakat so a plain query matches vocalized text", () => {
    // Allah written with fatha and shadda.
    const vocalized = "اللَّهِ";
    const plain = "الله";
    expect(normalizeArabic(vocalized)).toBe(normalizeArabic(plain));
  });

  it("matches the Quranic spelling of 'Allah'", () => {
    // Uthmani uses a dagger alef and superscript marks.
    expect(normalizeArabic("اللّٰه")).toBe("الله");
  });

  it("folds alef variants", () => {
    for (const v of ["أ", "إ", "آ", "ٱ", "ٲ", "ٳ"]) {
      expect(normalizeArabic(`ب${v}`)).toBe("با");
    }
  });

  it("folds ya and alef maqsura to yeh", () => {
    expect(normalizeArabic("على")).toBe(normalizeArabic("علي"));
    expect(normalizeArabic("ٰى")).toBe("ي");
  });

  it("folds ta marbuta to ha", () => {
    expect(normalizeArabic("الرحمة")).toBe(normalizeArabic("الرحمة".replace("ة", "ه")));
  });

  it("folds hamza-on-waw", () => {
    expect(normalizeArabic("مؤمن")).toBe(normalizeArabic("مومن"));
  });

  it("removes tatweel", () => {
    expect(normalizeArabic("كــتاب")).toBe("كتاب");
  });

  it("removes zero-width joiners", () => {
    expect(normalizeArabic("ل‍ا")).toBe(normalizeArabic("لا"));
  });

  it("leaves plain Arabic untouched", () => {
    expect(normalizeArabic("بسم الله")).toBe("بسم الله");
  });

  it("lowercases Latin so matching stays case-insensitive", () => {
    expect(normalizeArabic("Mercy")).toBe(normalizeArabic("mercy"));
    expect(normalizeArabic("MERCY")).toBe("mercy");
  });

  it("collapses whitespace and trims", () => {
    expect(normalizeArabic("  peace   upon  him ")).toBe("peace upon him");
  });

  it("handles empty input", () => {
    expect(normalizeArabic("")).toBe("");
  });

  it("finds a real verse given an unvocalized query", () => {
    // 2:255 opens with the Ayat al-Kursi.
    const verseStart = "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ";
    expect(normalizeArabic(verseStart)).toContain(normalizeArabic("الله"));
    expect(normalizeArabic(verseStart)).toContain(normalizeArabic("لا اله الا"));
  });
});

describe("escapeLikePattern", () => {
  it("escapes wildcard characters so a user cannot inject them", () => {
    expect(escapeLikePattern("100%")).toBe("100\\%");
    expect(escapeLikePattern("a_b")).toBe("a\\_b");
    expect(escapeLikePattern("back\\slash")).toBe("back\\\\slash");
  });

  it("leaves ordinary text alone", () => {
    expect(escapeLikePattern("mercy")).toBe("mercy");
  });
});
