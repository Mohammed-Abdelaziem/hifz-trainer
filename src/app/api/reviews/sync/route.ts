import { getSessionUser } from "@/lib/server/auth";
import { recordReview } from "@/lib/server/hifz-service";

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

    const results = [];

    for (const review of body.reviews) {
      if (!review.verseKey || !review.grade) continue;
      if (!VALID_GRADES.includes(review.grade)) continue;

      try {
        const result = await recordReview({
          userId: user.id,
          verseKey: review.verseKey,
          grade: review.grade as "AGAIN" | "HARD" | "GOOD" | "EASY",
          durationMs: review.durationMs,
        });
        results.push({ verseKey: review.verseKey, ok: true, result: result.result });
      } catch {
        const safeKey = review.verseKey.replace(/[^\d:]/g, "");
        console.error(`Failed to sync review for ${safeKey}`);
        results.push({ verseKey: review.verseKey, ok: false, error: "Sync failed" });
      }
    }

    return Response.json({ ok: true, synced: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length, results });
  } catch (err) {
    console.error("[/api/reviews/sync]", err);
    return Response.json({ error: "Failed to sync reviews" }, { status: 500 });
  }
}