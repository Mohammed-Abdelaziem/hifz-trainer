import { getSessionUser } from "@/lib/server/auth";
import { recordKnownRevision } from "@/lib/server/hifz-service";
import { isVerseKey } from "@/lib/quran/verse-key";
import { KNOWN_RANGE_MAX } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Body {
  surahId?: unknown;
  verseKeys?: unknown;
}

/**
 * Records a periodic revision for already-KNOWN surahs or verses, advancing
 * their next due date and logging ReviewLog entries for streak/analytics.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    let surahId: number | undefined;
    let verseKeys: string[] | undefined;

    if (Array.isArray(body.verseKeys)) {
      verseKeys = body.verseKeys.filter((k) => isVerseKey(k));
      if (verseKeys.length === 0) {
        return Response.json({ error: "No valid verse keys" }, { status: 400 });
      }
      if (verseKeys.length > KNOWN_RANGE_MAX) {
        return Response.json(
          { error: `Revise at most ${KNOWN_RANGE_MAX} verses at a time` },
          { status: 400 }
        );
      }
    } else if (body.surahId !== undefined) {
      const parsed = Number(body.surahId);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 114) {
        return Response.json({ error: "Invalid surahId" }, { status: 400 });
      }
      surahId = parsed;
    } else {
      return Response.json({ error: "Provide surahId or verseKeys" }, { status: 400 });
    }

    const result = await recordKnownRevision({ userId: user.id, surahId, verseKeys });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/known-revision]", err);
    return Response.json({ error: "Failed to record revision" }, { status: 500 });
  }
}
