import { GRADES, type Grade } from "@/types/quran";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { recordReview } from "@/lib/server/hifz-service";

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

  if (typeof verseKey !== "string" || !/^\d{1,3}:\d{1,3}$/.test(verseKey)) {
    return Response.json({ error: "verseKey must match 'surah:ayah'" }, { status: 400 });
  }
  if (typeof grade !== "string" || !GRADES.includes(grade as Grade)) {
    return Response.json(
      { error: `grade must be one of ${GRADES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const [user] = await Promise.all([getSessionUser(), isGuestSession()]);
    if (!user) return Response.json({ ok: true, guest: true });
    const data = await recordReview({
      userId: user.id,
      verseKey,
      grade: grade as Grade,
      durationMs: typeof durationMs === "number" ? durationMs : undefined,
    });
    return Response.json({ ok: true, ...data });
  } catch (err) {
    console.error("[/api/reviews]", err);
    return Response.json({ error: "Failed to record review" }, { status: 500 });
  }
}
