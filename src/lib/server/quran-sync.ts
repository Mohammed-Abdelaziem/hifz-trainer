import { getDbWithTest, sanitizeUrl } from "@/lib/db";
import { everyAyahUrl } from "@/lib/quran/timings";

const QURAN_API_BASE = "https://api.quran.com/api/v4";
const TOTAL_PAGES = 604;
const CONCURRENCY = 12;
const UPSERT_CHUNK = 300;

export interface SyncReport {
  ok: boolean;
  surahs: number;
  verses: number;
  failedPages: number[];
  durationMs: number;
  error?: string;
}

async function fetchJson<T>(url: string, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

interface ChapterMeta {
  id: number;
  name_arabic: string;
  name_simple: string;
  translated_name: { name: string };
  revelation_place: string;
  verses_count: number;
}

interface PageVerse {
  verse_key: string;
  text_uthmani: string;
  verse_number: number;
  page_number: number;
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
  const db = await getDbWithTest();
  const failedPages: number[] = [];

  try {
    const chaptersRes = await fetchJson<{ chapters: ChapterMeta[] }>(
      `${QURAN_API_BASE}/chapters?language=en`
    );

    for (const c of chaptersRes.chapters) {
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
    const collected: PageVerse[] = [];

    const settled = await mapWithConcurrency(pageNumbers, CONCURRENCY, async (page) => {
      const res = await fetchJson<{ verses: PageVerse[] }>(
        `${QURAN_API_BASE}/verses/by_page/${page}?fields=text_uthmani&per_page=50`
      );
      return res.verses;
    });

    settled.forEach((r, i) => {
      if (r.status === "fulfilled") {
        for (const v of r.value) collected.push(v);
      } else {
        failedPages.push(pageNumbers[i]);
      }
    });

    for (const page of failedPages.splice(0)) {
      try {
        const res = await fetchJson<{ verses: PageVerse[] }>(
          `${QURAN_API_BASE}/verses/by_page/${page}?fields=text_uthmani&per_page=50`
        );
        collected.push(...res.verses);
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
              pageNumber: v.page_number,
              uthmaniText: v.text_uthmani,
              translation: "",
              audioUrl: safeAudioUrl ?? audioUrl,
              timestampsJson: "[]",
            },
            update: {
              pageNumber: v.page_number,
              uthmaniText: v.text_uthmani,
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
      error: err instanceof Error ? err.message : "Unknown sync failure",
    };
  }
}

export interface SyncStatus {
  synced: boolean;
  surahs: number;
  verses: number;
  expectedVerses: number;
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const db = await getDbWithTest();
  const [surahs, verses] = await Promise.all([db.surah.count(), db.verse.count()]);
  const expectedVerses = await db.surah.aggregate({ _sum: { ayahCount: true } });
  return {
    synced: surahs === 114 && verses >= (expectedVerses._sum.ayahCount ?? Infinity),
    surahs,
    verses,
    expectedVerses: expectedVerses._sum.ayahCount ?? 0,
  };
}
