import { fetchJson } from "@/lib/server/fetch-json";
import { mergeSegments, type MergedSegment, type RawSegment } from "@/lib/quran/timings";
import { QURAN_API_BASE, API_TIMEOUT_LONG_MS } from "@/lib/constants";
import { DEFAULT_RECITER_ID, VALID_RECITER_IDS } from "@/lib/quran/reciters";

export const dynamic = "force-dynamic";

const MAX_SURAH = 114;
const PAGE_SIZE = 300;

interface ByChapterResponse {
  audio_files: { verse_key: string; segments?: RawSegment[] }[];
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;

    const surah = Number(params.get("surah") ?? "");
    if (!Number.isInteger(surah) || surah < 1 || surah > MAX_SURAH) {
      return Response.json({ error: "surah must be an integer between 1 and 114" }, { status: 400 });
    }

    let reciterId = Number(params.get("reciter") ?? "");
    if (!Number.isInteger(reciterId) || !VALID_RECITER_IDS.has(reciterId)) {
      reciterId = DEFAULT_RECITER_ID;
    }

    const res = await fetchJson<ByChapterResponse>(
      `${QURAN_API_BASE}/recitations/${reciterId}/by_chapter/${surah}?per_page=${PAGE_SIZE}&fields=segments`,
      { timeout: API_TIMEOUT_LONG_MS, retries: 1 }
    );

    const timings: Record<string, MergedSegment[]> = {};
    for (const file of res.audio_files ?? []) {
      if (!file?.verse_key) continue;
      const merged = mergeSegments(file.segments);
      if (merged.length > 0) timings[file.verse_key] = merged;
    }

    return Response.json({ surah, reciterId, timings });
  } catch (err) {
    console.error("[/api/word-timings]", err);
    return Response.json({ error: "Failed to load word timings" }, { status: 502 });
  }
}
