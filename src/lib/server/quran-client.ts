import { API_TIMEOUT_LONG_MS, QURAN_API_BASE } from "@/lib/constants";
import { fetchJson } from "./fetch-json";

export interface QcChapterMeta {
  id: number;
  name_arabic: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
  translated_name?: { name: string };
}

export interface QcVerseWord {
  position: number;
  char_type_name: string;
  text_uthmani: string | null;
  audio_url: string | null;
  translation: { text: string } | null;
  transliteration: { text: string } | null;
}

export interface QcVerse {
  verse_key: string;
  verse_number: number;
  page_number?: number;
  text_uthmani?: string;
  words?: QcVerseWord[];
  translations?: Array<{ resource_id?: number; text?: string }>;
}

export async function fetchAllChapters(opts?: {
  timeout?: number;
  retries?: number;
  backoffMs?: number;
}): Promise<QcChapterMeta[]> {
  const res = await fetchJson<{ chapters?: QcChapterMeta[] }>(
    `${QURAN_API_BASE}/chapters?language=en`,
    {
      timeout: opts?.timeout ?? API_TIMEOUT_LONG_MS,
      retries: opts?.retries ?? 2,
      backoffMs: opts?.backoffMs,
    }
  );
  return res.chapters ?? [];
}

export async function fetchChapterById(
  surahId: number,
  opts?: { timeout?: number; retries?: number; backoffMs?: number }
): Promise<QcChapterMeta | null> {
  const res = await fetchJson<{ chapter?: QcChapterMeta }>(
    `${QURAN_API_BASE}/chapters/${surahId}?language=en`,
    {
      timeout: opts?.timeout ?? API_TIMEOUT_LONG_MS,
      retries: opts?.retries ?? 1,
      backoffMs: opts?.backoffMs,
    }
  );
  return res.chapter ?? null;
}

interface QcPagination {
  per_page?: number;
  current_page?: number;
  next_page?: number | null;
  total_pages?: number;
  total_records?: number;
}

const QURAN_API_MAX_PER_PAGE = 50;
const CHAPTER_PAGE_CONCURRENCY = 3;

async function fetchPaginatedChapterVerses(
  baseUrl: string,
  fetchOpts: { timeout: number; retries: number; backoffMs?: number }
): Promise<QcVerse[]> {
  // Quran.com API v4 caps `per_page` at 50 regardless of what is requested.
  // Fetch page 1 first to discover `total_pages`, then fetch the remaining
  // pages with bounded concurrency so long surahs (e.g. Al-Baqarah, 286 ayahs
  // = 6 pages) are neither truncated at ayah 50 nor 429-throttled.
  const first = await fetchJson<{ verses?: QcVerse[]; pagination?: QcPagination }>(
    `${baseUrl}&page=1`,
    fetchOpts
  );
  const all: QcVerse[] = [...(first.verses ?? [])];
  const totalPages = Math.max(1, first.pagination?.total_pages ?? 1);
  if (totalPages <= 1) return all;

  const restPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  const pageResults: Array<QcVerse[] | undefined> = new Array(restPages.length);
  let cursor = 0;

  async function worker() {
    while (cursor < restPages.length) {
      const idx = cursor++;
      const res = await fetchJson<{ verses?: QcVerse[] }>(
        `${baseUrl}&page=${restPages[idx]}`,
        fetchOpts
      );
      pageResults[idx] = res.verses ?? [];
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CHAPTER_PAGE_CONCURRENCY, restPages.length) }, worker)
  );
  for (const verses of pageResults) {
    if (verses) all.push(...verses);
  }
  return all;
}

export async function fetchVersesByChapter(
  surahId: number,
  opts?: { timeout?: number; retries?: number; backoffMs?: number }
): Promise<QcVerse[]> {
  const fetchOpts = {
    timeout: opts?.timeout ?? API_TIMEOUT_LONG_MS,
    retries: opts?.retries ?? 1,
    backoffMs: opts?.backoffMs,
  };
  const baseUrl = `${QURAN_API_BASE}/verses/by_chapter/${surahId}?words=true&per_page=${QURAN_API_MAX_PER_PAGE}&word_fields=text_uthmani&translations=131`;
  return fetchPaginatedChapterVerses(baseUrl, fetchOpts);
}

/**
 * Lightweight chapter fetch (text + translation only, no word-by-word array).
 * ~20x smaller than `words=true`, ideal for on-demand DB corpus seeding of
 * long surahs like Al-Baqarah within serverless request budgets.
 */
export async function fetchVersesByChapterLightweight(
  surahId: number,
  opts?: { timeout?: number; retries?: number; backoffMs?: number }
): Promise<QcVerse[]> {
  const fetchOpts = {
    timeout: opts?.timeout ?? API_TIMEOUT_LONG_MS,
    retries: opts?.retries ?? 2,
    backoffMs: opts?.backoffMs,
  };
  const baseUrl = `${QURAN_API_BASE}/verses/by_chapter/${surahId}?fields=text_uthmani&per_page=${QURAN_API_MAX_PER_PAGE}&translations=131`;
  return fetchPaginatedChapterVerses(baseUrl, fetchOpts);
}

export async function fetchVerseByKeyLightweight(
  verseKey: string,
  opts?: { timeout?: number; retries?: number; backoffMs?: number }
): Promise<QcVerse | null> {
  const res = await fetchJson<{ verse?: QcVerse }>(
    `${QURAN_API_BASE}/verses/by_key/${verseKey}?fields=text_uthmani&translations=131`,
    {
      timeout: opts?.timeout ?? API_TIMEOUT_LONG_MS,
      retries: opts?.retries ?? 1,
      backoffMs: opts?.backoffMs,
    }
  );
  return res.verse ?? null;
}

export async function fetchVersesByPage(
  page: number,
  opts?: { timeout?: number; retries?: number; backoffMs?: number }
): Promise<QcVerse[]> {
  const res = await fetchJson<{ verses?: QcVerse[] }>(
    `${QURAN_API_BASE}/verses/by_page/${page}?fields=text_uthmani&translations=131&per_page=50`,
    {
      timeout: opts?.timeout ?? API_TIMEOUT_LONG_MS,
      retries: opts?.retries ?? 2,
      backoffMs: opts?.backoffMs,
    }
  );
  return res.verses ?? [];
}
