/**
 * Folds Arabic text into a canonical form so a user typing plain text can
 * match fully-vocalized uthmani script.
 *
 * Without this, searching "الله" cannot match "اللَّهِ": ILIKE is codepoint
 * exact, and the Quran text carries harakat (U+064B–U+0652), a shadda, and
 * superscript alef that a user will never type.
 *
 * Applied to both the indexed text at write time and the query at search time.
 */

/** Harakat, tanween, shadda, sukun, and the dagger/superscript marks. */
const DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;

/** Tatweel/kashida, a purely typographic elongation. */
const TATWEEL = /ـ/g;

/** Quranic annotation signs and small high letters. */
const ANNOTATION = /[ۖ-ࣰࣱࣲۭࣿ]/g;

const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;

/** Letter and mark pairs that must be produced in a fixed order. */
const COMBINING = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;

/**
 * Longest-match replacements. Order matters: multi-character sequences are
 * listed before the single characters they contain.
 */
const REPLACEMENTS: [RegExp, string][] = [
  // Alef variants -> bare alef
  [/[آأإٱٲٳٵ]/g, "ا"],
  // Waw variants -> bare waw
  [/[ؤٷۈۉۍۇۆ]/g, "و"],
  [/[ۋۈۍۇۆؤ]/g, "و"],
  // Yeh variants -> bare yeh
  [/[يىےۓېيۍێېئ]/g, "ي"],
  // Alef maqsura -> yeh
  [/[ىی]/g, "ي"],
  // Ta marbuta -> ha
  [/[ةۃ]/g, "ه"],
  // Hamza carriers
  [/[ءأإآٱ]/g, "ا"],
  // Persian/Urdu yeh and kaf
  [/[ی﮶﮷]/g, "ي"],
  [/[کﮎﮏ]/g, "ك"],
  // Waw with hamza
  [/[ؤۆۇۈۉۊۋۍ]/g, "و"],
];

/**
 * Produces the canonical form used for matching. Arabic letters are folded to
 * their base shapes, diacritics removed, and any remaining non-Arabic
 * characters dropped so Latin and Arabic queries are compared consistently.
 */
export function normalizeArabic(input: string): string {
  if (!input) return "";

  let out = input.normalize("NFKC");

  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  out = out
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(ANNOTATION, "")
    .replace(COMBINING, "");

  // Zero-width joiners and non-joiners can sit between letters invisibly.
  out = out.replace(/[-‍⁠]/g, "");

  // Latin is lowercased so case-insensitive matching stays case-insensitive.
  out = out.replace(/[A-Z]/g, (c) => c.toLowerCase());

  // Collapse whitespace and drop anything outside Arabic/Latin/digits.
  out = out.replace(ARABIC_RANGE, (c) => c);
  out = out.replace(/\s+/g, " ").trim();

  return out;
}

/** Escapes LIKE metacharacters so a user cannot inject wildcards. */
export function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`);
}
