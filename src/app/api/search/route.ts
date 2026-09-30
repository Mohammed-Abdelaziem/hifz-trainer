import { getDb } from "@/lib/db";
import { normalizeArabic, escapeLikePattern } from "@/lib/quran/arabic";

export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 64;

function parseLimit(raw: string | null): number {
  const parsed = Number(raw ?? "20");
  // Math.min(NaN, 50) is NaN, which Prisma rejects as `take`; and a negative
  // take means "from the end" rather than being clamped.
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 50) : 20;
}

type StoredWord = {
  text_uthmani?: string;
  translation?: string;
  transliteration?: string;
};

function buildSnippet(words: StoredWord[], query: string): string {
  const q = normalizeArabic(query);
  if (!q) return "";

  // The match can be in the Arabic, the translation, or the transliteration, so
  // each is checked in turn and the one that actually matched is quoted.
  const candidates: { text: string; arabic: boolean }[] = [];
  const arabic = words.map((w) => w.text_uthmani ?? "").join(" ");
  const latin = words.map((w) => w.translation ?? "").join(" ");
  if (arabic.trim()) candidates.push({ text: arabic, arabic: true });
  if (latin.trim()) candidates.push({ text: latin, arabic: false });

  for (const candidate of candidates) {
    const haystack = normalizeArabic(candidate.text);
    const idx = haystack.indexOf(q);
    if (idx < 0) continue;

    // Normalization can change string length, so the snippet is cut from the
    // original text using a ratio rather than the normalized offset.
    const ratio = idx / Math.max(haystack.length, 1);
    const rawIdx = Math.round(ratio * candidate.text.length);
    const pad = 30;
    const start = Math.max(0, rawIdx - pad);
    const end = Math.min(candidate.text.length, rawIdx + q.length + pad);
    const body = candidate.text.slice(start, end).trim();
    return `${start > 0 ? "…" : ""}${body}${end < candidate.text.length ? "…" : ""}`;
  }

  return latin.slice(0, 100) + (latin.length > 100 ? "…" : "");
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const q = params.get("q")?.trim();
    if (!q || q.length < 2) {
      return Response.json({ results: [], query: q ?? "" });
    }
    // Each query drives a search over every verse, so cap the input size.
    if (q.length > MAX_QUERY_LENGTH) {
      return Response.json({ results: [], query: q });
    }

    const limit = parseLimit(params.get("limit"));
    const needle = escapeLikePattern(normalizeArabic(q));
    if (!needle) return Response.json({ results: [], query: q });

    const db = await getDb();

    // Search the normalized side table when it exists. It is populated during
    // enrichment and carries a trigram index, which a leading-wildcard ILIKE
    // over the multi-KB wordsJson column cannot use.
    let verses: {
      verseKey: string;
      surahId: number;
      ayahNumber: number;
      wordsJson: string | null;
    }[] = [];

    const trgmAvailable = await db.$queryRaw<{ ok: number }[]>`
      SELECT 1 AS ok
      FROM pg_extension WHERE extname = 'pg_trgm'
    `.catch(() => [] as { ok: number }[]);

    if (trgmAvailable.length > 0) {
      verses = await db.$queryRaw<
        { verseKey: string; surahId: number; ayahNumber: number; wordsJson: string | null }[]
      >`
        SELECT s."verseKey", s."surahId", s."ayahNumber", v."wordsJson"
        FROM "VerseSearch" s
        JOIN "Verse" v ON v."verseKey" = s."verseKey"
        WHERE s."textNormalized" ILIKE ${'%' + needle + '%'} ESCAPE '\\'
        ORDER BY s."verseKey"
        LIMIT ${limit}
      `;
    } else {
      // Fallback for a database without the extension. Slow, but correct.
      verses = await db.verse.findMany({
        where: { wordsJson: { contains: q, mode: "insensitive" } },
        select: {
          verseKey: true,
          surahId: true,
          ayahNumber: true,
          wordsJson: true,
        },
        orderBy: { verseKey: "asc" },
        take: limit,
      });
    }

    const results = verses.map((v) => {
      let snippet = "";
      if (v.wordsJson) {
        try {
          snippet = buildSnippet(JSON.parse(v.wordsJson) as StoredWord[], q);
        } catch {
          snippet = "";
        }
      }
      return {
        verseKey: v.verseKey,
        surahId: v.surahId,
        ayahNumber: v.ayahNumber,
        snippet,
      };
    });

    return Response.json({ results, query: q });
  } catch (err) {
    console.error("[/api/search]", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
