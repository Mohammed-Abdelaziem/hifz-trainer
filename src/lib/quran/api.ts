import type { SurahBundle, Ayah, QuranWord } from "@/types/quran";
import { getDb } from "@/lib/db";
import { FIXTURE_SURAHS } from "./fixtures";
import { everyAyahUrl, synthTimings } from "./timings";

export interface SurahNavItem {
  id: number;
  name_arabic: string;
  name_simple: string;
  ayah_count: number;
}

const QURAN_API_BASE = "https://api.quran.com/api/v4";

async function fetchChapterMeta(
  surahId: number
): Promise<{ name_arabic: string; name_simple: string; english_name: string } | null> {
  try {
    const res = await fetch(`${QURAN_API_BASE}/chapters/${surahId}?language=en`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chapter?: {
        name_arabic: string;
        name_simple: string;
        translated_name?: { name: string };
      };
    };
    if (!json.chapter) return null;
    return {
      name_arabic: json.chapter.name_arabic,
      name_simple: json.chapter.name_simple,
      english_name: json.chapter.translated_name?.name ?? json.chapter.name_simple,
    };
  } catch {
    return null;
  }
}

export async function getAvailableSurahs(): Promise<SurahNavItem[]> {
  const fixtureItems = Object.values(FIXTURE_SURAHS).map((s) => ({
    id: s.id,
    name_arabic: s.name_arabic,
    name_simple: s.name_simple,
    ayah_count: s.ayah_count,
  }));

  try {
    const rows = await getDb().surah.findMany({ orderBy: { id: "asc" } });
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
  const db = getDb();
  const [surahRow, verseRows] = await Promise.all([
    db.surah.findUnique({ where: { id: surahId } }),
    db.verse.findMany({ where: { surahId }, orderBy: { ayahNumber: "asc" } }),
  ]);

  if (!surahRow || verseRows.length === 0) return null;

  const ayahs: Ayah[] = verseRows.map((row) => {
    let words: QuranWord[];
    if (row.wordsJson) {
      words = JSON.parse(row.wordsJson) as QuranWord[];
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

export async function getSurahBundle(surahId: number): Promise<SurahBundle | null> {
  const fixture = FIXTURE_SURAHS[surahId];
  if (fixture) {
    const meta = await fetchChapterMeta(surahId);
    return meta ? { ...fixture, ...meta } : fixture;
  }

  try {
    return await bundleFromDbRows(surahId);
  } catch (err) {
    console.error("[getSurahBundle]", err);
    return null;
  }
}
