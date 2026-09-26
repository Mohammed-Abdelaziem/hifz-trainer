import type { SurahBundle, Ayah, QuranWord } from "@/types/quran";
import { getDb } from "@/lib/db";
import { FIXTURE_SURAHS } from "./fixtures";
import { everyAyahUrl, synthTimings } from "./timings";
import { QURAN_API_BASE, VERSES_CDN } from "@/lib/constants";

interface SurahNavItem {
  id: number;
  name_arabic: string;
  name_simple: string;
  ayah_count: number;
}

const MIN_SURAH = 1;
const MAX_SURAH = 114;

export function isValidSurahId(surahId: number): boolean {
  return Number.isInteger(surahId) && surahId >= MIN_SURAH && surahId <= MAX_SURAH;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function fetchChapterMeta(
  surahId: number
): Promise<{ name_arabic: string; name_simple: string; english_name: string } | null> {
  return withRetry(async () => {
    try {
      const res = await fetch(`${QURAN_API_BASE}/chapters/${surahId}?language=en`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        chapter?: {
          name_arabic: string;
          name_simple: string;
          translated_name?: { name: string };
        };
      };
      if (!json.chapter) throw new Error("missing chapter");
      return {
        name_arabic: json.chapter.name_arabic,
        name_simple: json.chapter.name_simple,
        english_name: json.chapter.translated_name?.name ?? json.chapter.name_simple,
      };
    } catch (err) {
      // Swallow here so callers get null; withRetry still drives the retry.
      throw err;
    }
  }).catch(() => null);
}

export async function getAvailableSurahs(): Promise<SurahNavItem[]> {
  const fixtureItems = Object.values(FIXTURE_SURAHS).map((s) => ({
    id: s.id,
    name_arabic: s.name_arabic,
    name_simple: s.name_simple,
    ayah_count: s.ayah_count,
  }));

  try {
    const db = await getDb();
    const rows = await db.surah.findMany({ orderBy: { id: "asc" } });
    if (rows.length > 0) {
      return rows.map((s) => ({
        id: s.id,
        name_arabic: s.nameArabic,
        name_simple: s.nameSimple,
        ayah_count: s.ayahCount,
      }));
    }
  } catch {
    return fixtureItems;
  }
  return fixtureItems;
}

async function bundleFromDbRows(surahId: number): Promise<SurahBundle | null> {
  const db = await getDb();
  const [surahRow, verseRows] = await Promise.all([
    db.surah.findUnique({ where: { id: surahId } }),
    db.verse.findMany({ where: { surahId }, orderBy: { ayahNumber: "asc" } }),
  ]);

  if (!surahRow || verseRows.length === 0) return null;

  const ayahs: Ayah[] = verseRows.map((row) => {
    let words: QuranWord[];
    if (row.wordsJson) {
      try {
        words = JSON.parse(row.wordsJson) as QuranWord[];
      } catch {
        words = [];
      }
    } else {
      words = row.uthmaniText.split(" ").map((text, i) => ({
        id: `${row.verseKey}:${i + 1}`,
        text_uthmani: text,
        translation: "",
      }));
    }
    return {
      ayah_number: row.ayahNumber,
      verse_key: row.verseKey,
      words,
      audio_url: row.audioUrl || everyAyahUrl(row.verseKey),
      timings: synthTimings(words),
      tafsir: row.tafsir ?? "",
    };
  });

  return {
    id: surahId,
    name_arabic: surahRow.nameArabic,
    name_simple: surahRow.nameSimple,
    english_name: surahRow.englishName,
    revelation_place:
      surahRow.revelationPlace === "madinah" ? ("madinah" as const) : ("makkah" as const),
    ayah_count: ayahs.length,
    ayahs,
  };
}

interface QcVerseWord {
  position: number;
  char_type_name: string;
  text_uthmani: string | null;
  audio_url: string | null;
  translation: { text: string } | null;
  transliteration: { text: string } | null;
}

async function fetchVersesFromApi(surahId: number): Promise<Ayah[] | null> {
  return withRetry(async () => {
    const res = await fetch(
      `${QURAN_API_BASE}/verses/by_chapter/${surahId}?words=true&per_page=1000&word_fields=text_uthmani`,
      { cache: "no-store", signal: AbortSignal.timeout(20_000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      verses?: Array<{
        verse_key: string;
        verse_number: number;
        words: QcVerseWord[];
        text_uthmani: string;
      }>;
    };
    if (!json.verses || json.verses.length === 0) throw new Error("no verses");

    return json.verses.map((v) => {
      const words: QuranWord[] = v.words
        .filter((w) => w.char_type_name === "word" && w.text_uthmani)
        .map((w) => ({
          id: `${v.verse_key}:${w.position}`,
          text_uthmani: w.text_uthmani!,
          translation: w.translation?.text ?? "",
          transliteration: w.transliteration?.text ?? undefined,
          audio_url: w.audio_url
            ? w.audio_url.startsWith("http")
              ? w.audio_url
              : `${VERSES_CDN}${w.audio_url}`
            : undefined,
        }));

      return {
        ayah_number: v.verse_number,
        verse_key: v.verse_key,
        words,
        audio_url: everyAyahUrl(v.verse_key),
        timings: synthTimings(words),
        tafsir: "",
      };
    });
  }).catch(() => null);
}

export async function getSurahBundle(surahId: number): Promise<SurahBundle | null> {
  if (!isValidSurahId(surahId)) return null;

  const fixture = FIXTURE_SURAHS[surahId];
  if (fixture) {
    const meta = await fetchChapterMeta(surahId);
    return meta ? { ...fixture, ...meta } : fixture;
  }

  try {
    const fromDb = await withRetry(() => bundleFromDbRows(surahId));
    if (fromDb) return fromDb;
  } catch {
    // DB unavailable — fall through to the upstream API
  }

  const [meta, verses] = await Promise.all([
    fetchChapterMeta(surahId),
    fetchVersesFromApi(surahId),
  ]);

  if (meta && verses && verses.length > 0) {
    return {
      id: surahId,
      name_arabic: meta.name_arabic,
      name_simple: meta.name_simple,
      english_name: meta.english_name,
      revelation_place: "makkah",
      ayah_count: verses.length,
      ayahs: verses,
    };
  }

  // Degrade gracefully instead of throwing a 404: the reader renders a
  // "no verse data" state the user can recover from by refreshing.
  if (meta) {
    return {
      id: surahId,
      name_arabic: meta.name_arabic,
      name_simple: meta.name_simple,
      english_name: meta.english_name,
      revelation_place: "makkah",
      ayah_count: 0,
      ayahs: [],
    };
  }

  return {
    id: surahId,
    name_arabic: "",
    name_simple: `Surah ${surahId}`,
    english_name: "",
    revelation_place: "makkah",
    ayah_count: 0,
    ayahs: [],
  };
}
