import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const q = params.get("q")?.trim();
    if (!q || q.length < 2) {
      return Response.json({ results: [], query: q ?? "" });
    }
    // Each query drives an unindexed ILIKE '%…%' scan of every verse, so cap
    // the input size rather than letting a multi-megabyte string reach the DB.
    if (q.length > 64) {
      return Response.json({ results: [], query: q });
    }

    // Math.min(NaN, 50) is NaN, which Prisma rejects as `take`; and a negative
    // take means "from the end" rather than being clamped.
    const rawLimit = Number(params.get("limit") ?? "20");
    const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 20;
    const db = await getDb();

    const verses = await db.verse.findMany({
      where: {
        OR: [
          { verseKey: { contains: q, mode: "insensitive" } },
          { wordsJson: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        verseKey: true,
        surahId: true,
        ayahNumber: true,
        wordsJson: true,
      },
      take: limit,
    });

    const results = verses.map((v) => {
      let snippet = "";
      if (v.wordsJson) {
        try {
          const words = JSON.parse(v.wordsJson) as { text_uthmani: string; translation: string }[];
          const translation = words.map((w) => w.translation).join(" ");
          const matchIdx = translation.toLowerCase().indexOf(q.toLowerCase());
          if (matchIdx >= 0) {
            const start = Math.max(0, matchIdx - 40);
            const end = Math.min(translation.length, matchIdx + q.length + 60);
            snippet = (start > 0 ? "..." : "") + translation.slice(start, end) + (end < translation.length ? "..." : "");
          } else {
            snippet = translation.slice(0, 100) + (translation.length > 100 ? "..." : "");
          }
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
