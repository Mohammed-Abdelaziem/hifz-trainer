import { GRADES, type Grade } from "@/types/quran";
import { getSessionUser } from "@/lib/server/auth";
import { recordReview } from "@/lib/server/hifz-service";
import { isVerseKey } from "@/lib/quran/verse-key";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ReviewBody {
  verseKey?: unknown;
  grade?: unknown;
  durationMs?: unknown;
}

export async function POST(req: Request) {
  let body: ReviewBody;
  try {
    body = (await req.json()) as ReviewBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { verseKey, grade, durationMs } = body;

  if (!isVerseKey(verseKey)) {
    return Response.json({ error: "verseKey must match 'surah:ayah'" }, { status: 400 });
  }
  if (typeof grade !== "string" || !GRADES.includes(grade as Grade)) {
    return Response.json(
      { error: `grade must be one of ${GRADES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    // Existence must be checked here: the FK would otherwise only surface as
    // a Prisma P2003, which mapped to a 500 for a request the client simply
    // cannot fix.
    const db = await getDb();
    const verse = await db.verse.findUnique({
      where: { verseKey },
      select: { verseKey: true },
    });
    if (!verse) return Response.json({ error: `Unknown verse ${verseKey}` }, { status: 400 });
    const data = await recordReview({
      userId: user.id,
      verseKey,
      grade: grade as Grade,
      durationMs: typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0 && durationMs <= 3600000 ? durationMs : undefined,
    });
    return Response.json({ ok: true, ...data });
  } catch (err) {
    console.error("[/api/reviews]", err);
    return Response.json({ error: "Failed to record review" }, { status: 500 });
  }
}
