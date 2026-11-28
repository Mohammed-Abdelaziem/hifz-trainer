import type { getDb } from "@/lib/db";
import { FIXTURE_SURAHS } from "@/lib/quran/fixtures";
import { everyAyahUrl } from "@/lib/quran/timings";
import {
  fetchChapterById,
  fetchVerseByKeyLightweight,
  fetchVersesByChapterLightweight,
  type QcVerse,
} from "@/lib/server/quran-client";

/**
 * Builds a surahId -> name map, preferring the Surah table and falling back to
 * the two-surah fixture for a database that has not been synced yet.
 */
export function buildSurahNameMap(
  rows: { id: number; nameSimple: string }[]
): Map<number, string> {
  const names = new Map<number, string>();
  for (const row of rows) names.set(row.id, row.nameSimple);
  for (const s of Object.values(FIXTURE_SURAHS)) {
    if (!names.has(s.id)) names.set(s.id, s.name_simple);
  }
  return names;
}

/**
 * When the database only holds a partial corpus (e.g. before full sync),
 * verses for a surah opened via the upstream API are not yet in `Verse`,
 * causing FK-guarded inserts in `addToSabaq` / `markKnown` to reject them.
 * Seed any missing surah's `Surah` + `Verse` rows on demand from Quran.com.
 */
export async function ensureMissingSurahsForKeys(
  db: Awaited<ReturnType<typeof getDb>>,
  missingKeys: string[]
): Promise<void> {
  if (
    missingKeys.length === 0 ||
    typeof db.surah?.upsert !== "function" ||
    typeof db.verse?.createMany !== "function"
  ) {
    return;
  }

  const surahIds = [
    ...new Set(
      missingKeys
        .map((k) => Number.parseInt(k.split(":")[0] ?? "", 10))
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= 114)
    ),
  ];

  for (const surahId of surahIds) {
    try {
      const fixture = FIXTURE_SURAHS[surahId];
      if (fixture) {
        const existingCount = await db.verse.count({ where: { surahId } });
        if (existingCount >= fixture.ayah_count) continue;

        await db.surah.upsert({
          where: { id: surahId },
          create: {
            id: surahId,
            nameArabic: fixture.name_arabic,
            nameSimple: fixture.name_simple,
            englishName: fixture.english_name,
            revelationPlace: fixture.revelation_place,
            ayahCount: fixture.ayah_count,
          },
          update: {
            nameArabic: fixture.name_arabic,
            nameSimple: fixture.name_simple,
            englishName: fixture.english_name,
            revelationPlace: fixture.revelation_place,
            ayahCount: fixture.ayah_count,
          },
        });
        await db.verse.createMany({
          data: fixture.ayahs.map((a) => ({
            verseKey: a.verse_key,
            surahId,
            ayahNumber: a.ayah_number,
            pageNumber: surahId === 1 ? 1 : 604,
            uthmaniText: a.words.map((w) => w.text_uthmani).join(" "),
            translation: a.translation ?? "",
            audioUrl: a.audio_url || everyAyahUrl(a.verse_key),
          })),
          skipDuplicates: true,
        });
        continue;
      }

      const keysForSurah = missingKeys.filter(
        (k) => Number.parseInt(k.split(":")[0] ?? "", 10) === surahId
      );

      const c = await fetchChapterById(surahId).catch(() => null);
      if (!c) continue;

      const existingCount = await db.verse.count({ where: { surahId } });
      if (existingCount >= c.verses_count) continue;

      // Prefer lightweight full-chapter fetch (no words=true -> ~20x smaller).
      // If that fails (e.g. transient upstream throttling), fall back to
      // fetching just the requested verse keys so partial-surah tracking still
      // succeeds immediately.
      let verses: QcVerse[] = await fetchVersesByChapterLightweight(surahId).catch(() => []);
      if (verses.length === 0 && keysForSurah.length > 0) {
        const fetched = await Promise.all(
          keysForSurah.slice(0, 50).map((key) =>
            fetchVerseByKeyLightweight(key).catch(() => null)
          )
        );
        verses = fetched.filter((v): v is QcVerse => v !== null);
      }
      if (verses.length === 0) continue;

      await db.surah.upsert({
        where: { id: surahId },
        create: {
          id: surahId,
          nameArabic: c.name_arabic,
          nameSimple: c.name_simple,
          englishName: c.translated_name?.name ?? c.name_simple,
          revelationPlace: c.revelation_place,
          ayahCount: c.verses_count,
        },
        update: {
          nameArabic: c.name_arabic,
          nameSimple: c.name_simple,
          englishName: c.translated_name?.name ?? c.name_simple,
          revelationPlace: c.revelation_place,
          ayahCount: c.verses_count,
        },
      });

      await db.verse.createMany({
        data: verses.map((v) => {
          const text =
            v.text_uthmani ||
            (v.words ?? [])
              .filter((w) => w.char_type_name === "word" && w.text_uthmani)
              .map((w) => w.text_uthmani!)
              .join(" ");
          return {
            verseKey: v.verse_key,
            surahId,
            ayahNumber: v.verse_number,
            pageNumber: v.page_number ?? 1,
            uthmaniText: text,
            translation: v.translations?.[0]?.text ?? "",
            audioUrl: everyAyahUrl(v.verse_key),
          };
        }),
        skipDuplicates: true,
      });
    } catch (err) {
      console.error(`[ensureMissingSurahsForKeys] failed for surah ${surahId}`, err);
    }
  }
}
