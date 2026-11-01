import { getSessionUser } from "@/lib/server/auth";
import { recordReading } from "@/lib/server/hifz-service";
import { isVerseKey } from "@/lib/quran/verse-key";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ReadingBody {
  verseKey?: unknown;
  durationMs?: unknown;
}

export async function POST(req: Request) {
  let body: ReadingBody;
  try {
    body = (await req.json()) as ReadingBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { verseKey, durationMs } = body;

  if (!isVerseKey(verseKey)) {
    return Response.json({ error: "verseKey must match 'surah:ayah'" }, { status: 400 });
  }

  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const verse = await db.verse.findUnique({
      where: { verseKey },
      select: { verseKey: true },
    });
    if (!verse) return Response.json({ error: `Unknown verse ${verseKey}` }, { status: 400 });

    await recordReading({
      userId: user.id,
      verseKey,
      durationMs:
        typeof durationMs === "number" &&
        Number.isFinite(durationMs) &&
        durationMs >= 0 &&
        durationMs <= 3_600_000
          ? durationMs
          : undefined,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[/api/reading]", err);
    return Response.json({ error: "Failed to record reading" }, { status: 500 });
  }
}

/**
 * Listen count for one verse: the grade-ready nudge in the reader needs to
 * know how many times this ayah has been heard (across all sessions) before
 * it asks "ready to grade?". Same access rules as POST.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const verseKey = url.searchParams.get("verseKey") ?? undefined;
  if (!isVerseKey(verseKey)) {
    return Response.json({ error: "verseKey must match 'surah:ayah'" }, { status: 400 });
  }

  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const state = await db.userMemoryState.findUnique({
      where: { userId_verseKey: { userId: user.id, verseKey } },
      select: { readCount: true, lastReadAt: true },
    });
    return Response.json({
      verseKey,
      readCount: state?.readCount ?? 0,
      lastReadAt: state?.lastReadAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("[/api/reading]", err);
    return Response.json({ error: "Failed to load reading state" }, { status: 500 });
  }
}
