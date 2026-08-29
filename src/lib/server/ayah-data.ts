import type { QuranWord } from "@/types/quran";
import { getDb } from "@/lib/db";
import { DEFAULT_RECITER_ID, VALID_RECITER_IDS } from "@/lib/quran/reciters";

const QURAN_API_BASE = "https://api.quran.com/api/v4";
const VERSES_CDN = "https://verses.quran.com/";
const TAFSIR_RESOURCE_ID = 169;

export interface AyahData {
  verseKey: string;
  words: QuranWord[];
  recitationUrl: string | null;
  tafsir: string | null;
  source: "synthetic" | "quran";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchTafsir(verseKey: string): Promise<string | null> {
  const res = await fetchJson<{ tafsir?: { text?: string } }>(
    `${QURAN_API_BASE}/tafsirs/${TAFSIR_RESOURCE_ID}/by_ayah/${verseKey}`
  ).catch(() => null);
  const raw = res?.tafsir?.text;
  return raw ? stripHtml(raw) : null;
}

interface QcWord {
  position: number;
  char_type_name: string;
  text_uthmani: string | null;
  audio_url: string | null;
  translation: { text: string } | null;
  transliteration: { text: string } | null;
}

async function fetchJson<T>(url: string, retries = 1): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function getCachedRecitationUrl(verseKey: string, reciterId: number): Promise<string | null> {
  const cached = await getDb().recitationAudio.findUnique({
    where: { verseKey_reciterId: { verseKey, reciterId } },
  });
  return cached?.url ?? null;
}

async function fetchAndCacheRecitationUrl(verseKey: string, reciterId: number): Promise<string | null> {
  const res = await fetchJson<{ audio_files: { url: string }[] }>(
    `${QURAN_API_BASE}/recitations/${reciterId}/by_ayah/${verseKey}`
  ).catch(() => null);
  const url = res?.audio_files?.[0]?.url ? VERSES_CDN + res.audio_files[0].url : null;
  if (url) {
    await getDb().recitationAudio.upsert({
      where: { verseKey_reciterId: { verseKey, reciterId } },
      create: { verseKey, reciterId, url },
      update: { url },
    });
  }
  return url;
}

export async function getOrFetchAyahData(
  verseKey: string,
  reciterId: number = DEFAULT_RECITER_ID
): Promise<AyahData> {
  if (!VALID_RECITER_IDS.has(reciterId)) reciterId = DEFAULT_RECITER_ID;

  const db = getDb();
  const row = await db.verse.findUnique({ where: { verseKey } });

  let words: QuranWord[] | null = null;
  if (row?.wordsSource === "quran" && row.wordsJson) {
    words = JSON.parse(row.wordsJson) as QuranWord[];
  }

  const cachedUrl = await getCachedRecitationUrl(verseKey, reciterId);

  if (words && row?.recitationUrl && cachedUrl === null && reciterId === DEFAULT_RECITER_ID) {
    await db.recitationAudio.upsert({
      where: { verseKey_reciterId: { verseKey, reciterId } },
      create: { verseKey, reciterId, url: row.recitationUrl },
      update: {},
    });
  }

  const needsTafsir = Boolean(row) && !row?.tafsir;
  const [freshWords, freshUrl, tafsir] = await Promise.all([
    words
      ? null
      : fetchJson<{ verse: { words: QcWord[] } }>(
          `${QURAN_API_BASE}/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani`
        ),
    cachedUrl ?? fetchAndCacheRecitationUrl(verseKey, reciterId),
    needsTafsir ? fetchTafsir(verseKey) : null,
  ]);

  if (!words && freshWords) {
    words = freshWords.verse.words
      .filter((w) => w.char_type_name === "word" && w.text_uthmani)
      .map((w) => ({
        id: `${verseKey}:${w.position}`,
        text_uthmani: w.text_uthmani!,
        translation: w.translation?.text ?? "",
        transliteration: w.transliteration?.text ?? undefined,
        audio_url: w.audio_url ? VERSES_CDN + w.audio_url : undefined,
      }));
  }

  const wordsFreshened = Boolean(words) && row?.wordsSource !== "quran";
  if (row && (wordsFreshened || tafsir)) {
    await db.verse.update({
      where: { verseKey },
      data: {
        ...(wordsFreshened
          ? { wordsJson: JSON.stringify(words), wordsSource: "quran" }
          : {}),
        ...(tafsir ? { tafsir } : {}),
      },
    });
  }

  if (!row) {
    return {
      verseKey,
      words: words ?? [],
      recitationUrl: freshUrl,
      tafsir,
      source: words ? "quran" : "synthetic",
    };
  }

  return {
    verseKey,
    words: words ?? [],
    recitationUrl: freshUrl,
    tafsir: row.tafsir ?? tafsir,
    source: words ? "quran" : "synthetic",
  };
}

export interface BulkWarmReport {
  processed: number;
  enriched: number;
  failed: number;
  remaining: number;
  durationMs: number;
}

const BULK_CONCURRENCY = 12;

export async function bulkWarmAyahData(limit: number): Promise<BulkWarmReport> {
  const startedAt = Date.now();
  const db = getDb();
  const pending = await db.verse.findMany({
    where: { wordsSource: "synthetic" },
    select: { verseKey: true },
    orderBy: [{ surahId: "asc" }, { ayahNumber: "asc" }],
    take: limit,
  });

  let enriched = 0;
  let failed = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < pending.length) {
      const index = cursor++;
      try {
        await getOrFetchAyahData(pending[index].verseKey);
        enriched++;
      } catch {
        failed++;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(BULK_CONCURRENCY, pending.length) }, worker));

  const remaining = await db.verse.count({ where: { wordsSource: "synthetic" } });

  return {
    processed: pending.length,
    enriched,
    failed,
    remaining,
    durationMs: Date.now() - startedAt,
  };
}
