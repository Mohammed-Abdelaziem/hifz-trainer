import { getSessionUser } from "@/lib/server/auth";
import { recordReview } from "@/lib/server/hifz-service";
import { isVerseKey } from "@/lib/quran/verse-key";
import { getDb } from "@/lib/db";

const VALID_GRADES = ["AGAIN", "HARD", "GOOD", "EASY"];
const MAX_BATCH_SIZE = 100;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null) as { reviews?: Array<{ verseKey: string; grade: string; durationMs?: number }> } | null;
    if (!body?.reviews || !Array.isArray(body.reviews)) {
      return Response.json({ error: "reviews array required" }, { status: 400 });
    }

    if (body.reviews.length > MAX_BATCH_SIZE) {
      return Response.json({ error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}` }, { status: 400 });
    }

    // One existence pass for the whole batch: unknown keys were previously
    // handed to recordReview where the FK surfaced as a P2003 that got logged
    // as a generic "Sync failed" with no error object attached.
    const candidateKeys = [...new Set(body.reviews.map((r) => r.verseKey))];
    let knownKeys = new Set<string>();
    if (candidateKeys.length > 0) {
      const db = await getDb();
      const rows = await db.verse.findMany({
        where: { verseKey: { in: candidateKeys } },
        select: { verseKey: true },
      });
      knownKeys = new Set(rows.map((r) => r.verseKey));
    }

    const results = [];

    for (const review of body.reviews) {
      if (!review.verseKey || !review.grade) continue;
      if (!VALID_GRADES.includes(review.grade)) continue;
      if (!isVerseKey(review.verseKey)) continue;

      if (!knownKeys.has(review.verseKey)) {
        results.push({ verseKey: review.verseKey, ok: false, error: `Unknown verse ${review.verseKey}` });
        continue;
      }

      const durationMs = typeof review.durationMs === "number" && Number.isFinite(review.durationMs) && review.durationMs >= 0 && review.durationMs <= 3600000
        ? review.durationMs
        : undefined;

      try {
        const result = await recordReview({
          userId: user.id,
          verseKey: review.verseKey,
          grade: review.grade as "AGAIN" | "HARD" | "GOOD" | "EASY",
          durationMs,
        });
        results.push({ verseKey: review.verseKey, ok: true, result: result.result });
      } catch (err) {
        const safeKey = review.verseKey.replace(/[^\d:]/g, "");
        console.error(`Failed to sync review for ${safeKey}`, err);
        results.push({ verseKey: review.verseKey, ok: false, error: "Sync failed" });
      }
    }

    return Response.json({ ok: true, synced: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length, results });
  } catch (err) {
    console.error("[/api/reviews/sync]", err);
    return Response.json({ error: "Failed to sync reviews" }, { status: 500 });
  }
}
