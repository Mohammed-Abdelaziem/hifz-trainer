import { Prisma } from "../../../generated/prisma";
import type { getDb } from "@/lib/db";
import { FIXTURE_SURAHS } from "@/lib/quran/fixtures";
import { everyAyahUrl } from "@/lib/quran/timings";
import {
  fetchChapterById,
  fetchVerseByKeyLightweight,
  fetchVersesByChapterLightweight,
  type QcVerse,
} from "@/lib/server/quran-client";

interface SeedVerseRow {
  verseKey: string;
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
  uthmaniText: string;
  translation: string;
  audioUrl: string;
}

export interface SeedDiagnostic {
  stage: string;
  code?: string;
}

function safeErrorCode(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) return err.code;
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") {
    return err.code;
  }
  if (err instanceof Error) {
    const httpMatch = /HTTP \d{3}/.exec(err.message);
    if (httpMatch) return httpMatch[0];
    if (err.name && err.name !== "Error") return err.name;
    return err.message.slice(0, 80);
  }
  return "unknown";
}

/**
 * Inserts verse rows via Prisma `createMany`, falling back to a parameterized
 * raw INSERT with `timestampsJson = '[]'` if `createMany` fails (for example,
 * on databases that have not yet applied migration
 * `20261018000000_drop_timestampsjson_add_verse_surah_fk`).
 */
async function insertVersesResilient(
  db: Awaited<ReturnType<typeof getDb>>,
  rows: SeedVerseRow[]
): Promise<void> {
  if (rows.length === 0) return;
  try {
    await db.verse.createMany({
      data: rows,
      skipDuplicates: true,
    });
  } catch (createErr) {
    if (typeof db.$executeRaw !== "function") throw createErr;

    try {
      const CHUNK = 100;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const values = chunk.map(
          (r) =>
            Prisma.sql`(${r.verseKey}, ${r.surahId}, ${r.ayahNumber}, ${r.pageNumber}, ${r.uthmaniText}, ${r.translation}, ${r.audioUrl}, ${"[]"})`
        );
        await db.$executeRaw`
          INSERT INTO "Verse" (
            "verseKey", "surahId", "ayahNumber", "pageNumber",
            "uthmaniText", "translation", "audioUrl", "timestampsJson"
          )
          VALUES ${Prisma.join(values)}
          ON CONFLICT ("verseKey") DO NOTHING
        `;
      }
    } catch (rawErr) {
      console.error("[insertVersesResilient] createMany failed:", createErr);
      console.error("[insertVersesResilient] raw fallback failed:", rawErr);
      throw createErr;
    }
  }
}

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
): Promise<SeedDiagnostic | null> {
  if (
    missingKeys.length === 0 ||
    typeof db.surah?.upsert !== "function" ||
    typeof db.verse?.createMany !== "function"
  ) {
    return null;
  }

  const surahIds = [
    ...new Set(
      missingKeys
        .map((k) => Number.parseInt(k.split(":")[0] ?? "", 10))
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= 114)
    ),
  ];

  let lastDiagnostic: SeedDiagnostic | null = null;

  for (const surahId of surahIds) {
    let stage = "init";
    try {
      const fixture = FIXTURE_SURAHS[surahId];
      if (fixture) {
        const existingCount = await db.verse.count({ where: { surahId } });
        if (existingCount >= fixture.ayah_count) continue;

        stage = "fixture_surah_upsert";
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
        stage = "fixture_verse_insert";
        await insertVersesResilient(
          db,
          fixture.ayahs.map((a) => ({
            verseKey: a.verse_key,
            surahId,
            ayahNumber: a.ayah_number,
            pageNumber: surahId === 1 ? 1 : 604,
            uthmaniText: a.words.map((w) => w.text_uthmani).join(" "),
            translation: a.translation ?? "",
            audioUrl: a.audio_url || everyAyahUrl(a.verse_key),
          }))
        );
        continue;
      }

      const keysForSurah = missingKeys.filter(
        (k) => Number.parseInt(k.split(":")[0] ?? "", 10) === surahId
      );

      stage = "chapter_fetch";
      const c = await fetchChapterById(surahId).catch((err) => {
        console.error(`[ensureMissingSurahsForKeys] chapter_fetch failed for ${surahId}`, err);
        return null;
      });

      if (c) {
        const existingCount = await db.verse.count({ where: { surahId } });
        if (existingCount >= c.verses_count) continue;
      }

      stage = "verses_fetch";
      let verses: QcVerse[] = await fetchVersesByChapterLightweight(surahId).catch((err) => {
        console.error(`[ensureMissingSurahsForKeys] verses_fetch failed for ${surahId}`, err);
        return [];
      });
      if (verses.length === 0 && keysForSurah.length > 0) {
        stage = "verses_by_key_fetch";
        const fetched = await Promise.all(
          keysForSurah.slice(0, 50).map((key) =>
            fetchVerseByKeyLightweight(key).catch(() => null)
          )
        );
        verses = fetched.filter((v): v is QcVerse => v !== null);
      }
      if (verses.length === 0) {
        lastDiagnostic = { stage, code: "empty_verses" };
        continue;
      }

      stage = "surah_upsert";
      await db.surah.upsert({
        where: { id: surahId },
        create: {
          id: surahId,
          nameArabic: c?.name_arabic ?? "",
          nameSimple: c?.name_simple ?? `Surah ${surahId}`,
          englishName: c?.translated_name?.name ?? c?.name_simple ?? `Surah ${surahId}`,
          revelationPlace: c?.revelation_place ?? "makkah",
          ayahCount: c?.verses_count ?? verses.length,
        },
        update: c
          ? {
              nameArabic: c.name_arabic,
              nameSimple: c.name_simple,
              englishName: c.translated_name?.name ?? c.name_simple,
              revelationPlace: c.revelation_place,
              ayahCount: c.verses_count,
            }
          : {},
      });

      stage = "verse_insert";
      await insertVersesResilient(
        db,
        verses
          .filter((v) => typeof v.verse_key === "string" && v.verse_key.includes(":"))
          .map((v) => {
            const parsedAyah = Number.parseInt(v.verse_key.split(":")[1] ?? "", 10);
            const ayahNumber =
              Number.isInteger(v.verse_number) && v.verse_number > 0
                ? v.verse_number
                : Number.isInteger(parsedAyah)
                  ? parsedAyah
                  : 1;
            const text =
              v.text_uthmani ||
              (v.words ?? [])
                .filter((w) => w.char_type_name === "word" && w.text_uthmani)
                .map((w) => w.text_uthmani!)
                .join(" ");
            return {
              verseKey: v.verse_key,
              surahId,
              ayahNumber,
              pageNumber: Number.isInteger(v.page_number) ? v.page_number! : 1,
              uthmaniText: text,
              translation: v.translations?.[0]?.text ?? "",
              audioUrl: everyAyahUrl(v.verse_key),
            };
          })
      );
    } catch (err) {
      const code = safeErrorCode(err);
      lastDiagnostic = { stage, code };
      console.error(`[ensureMissingSurahsForKeys] failed for surah ${surahId} at ${stage}`, err);
    }
  }

  return lastDiagnostic;
}
