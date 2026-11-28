import { getDb, sanitizeUrl } from "@/lib/db";
import { everyAyahUrl } from "@/lib/quran/timings";
import { fetchAllChapters, fetchVersesByPage, type QcVerse } from "@/lib/server/quran-client";

const TOTAL_PAGES = 604;
const CONCURRENCY = 12;
const UPSERT_CHUNK = 300;

interface SyncReport {
  ok: boolean;
  surahs: number;
  verses: number;
  failedPages: number[];
  durationMs: number;
  error?: string;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { status: "fulfilled", value: await fn(items[index]) };
      } catch (err) {
        results[index] = { status: "rejected", reason: err };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

export async function syncFullQuran(): Promise<SyncReport> {
  const startedAt = Date.now();
  const db = await getDb();
  const failedPages: number[] = [];

  try {
    const chapters = await fetchAllChapters();

    for (const c of chapters) {
      await db.surah.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
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
    }

    const pageNumbers = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);
    const collected: QcVerse[] = [];

    const settled = await mapWithConcurrency(pageNumbers, CONCURRENCY, (page) =>
      fetchVersesByPage(page)
    );

    settled.forEach((r, i) => {
      if (r.status === "fulfilled") {
        for (const v of r.value) collected.push(v);
      } else {
        failedPages.push(pageNumbers[i]);
      }
    });

    for (const page of failedPages.splice(0)) {
      try {
        collected.push(...(await fetchVersesByPage(page)));
      } catch {
        failedPages.push(page);
      }
    }

    for (let i = 0; i < collected.length; i += UPSERT_CHUNK) {
      const chunk = collected.slice(i, i + UPSERT_CHUNK);
      await db.$transaction(
        chunk.map((v) => {
          const [surahStr, ayahStr] = v.verse_key.split(":");
          const audioUrl = everyAyahUrl(v.verse_key);
          const safeAudioUrl = sanitizeUrl(audioUrl);
          if (!safeAudioUrl) {
            console.error(`[quran-sync] INVALID audioUrl for verseKey=${v.verse_key}: "${audioUrl}"`);
          }
          return db.verse.upsert({
            where: { verseKey: v.verse_key },
            create: {
              verseKey: v.verse_key,
              surahId: Number(surahStr),
              ayahNumber: Number(ayahStr),
              pageNumber: v.page_number ?? 1,
              uthmaniText: v.text_uthmani ?? "",
              translation: v.translations?.[0]?.text ?? "",
              audioUrl: safeAudioUrl ?? audioUrl,
            },
            // Only overwrite when the upstream call actually carried a
            // translation so a degraded retry can't wipe existing content.
            update: {
              pageNumber: v.page_number ?? 1,
              uthmaniText: v.text_uthmani ?? "",
              ...(v.translations?.[0]?.text ? { translation: v.translations[0].text! } : {}),
            },
          });
        })
      );
    }

    const [surahCount, verseCount] = await Promise.all([
      db.surah.count(),
      db.verse.count(),
    ]);

    return {
      ok: true,
      surahs: surahCount,
      verses: verseCount,
      failedPages,
      durationMs: Date.now() - startedAt,
    };
  } catch (err) {
    console.error("[quran-sync]", err);
    return {
      ok: false,
      surahs: 0,
      verses: 0,
      failedPages,
      durationMs: Date.now() - startedAt,
      error: "Sync failed",
    };
  }
}

interface SyncStatus {
  synced: boolean;
  surahs: number;
  verses: number;
  expectedVerses: number;
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const db = await getDb();
  const [surahs, verses] = await Promise.all([db.surah.count(), db.verse.count()]);
  const expectedVerses = await db.surah.aggregate({ _sum: { ayahCount: true } });
  return {
    synced: surahs === 114 && verses >= (expectedVerses._sum.ayahCount ?? Infinity),
    surahs,
    verses,
    expectedVerses: expectedVerses._sum.ayahCount ?? 0,
  };
}
