import { getSessionUser } from "@/lib/server/auth";
import { markKnown } from "@/lib/server/hifz-service";
import { isVerseKey } from "@/lib/quran/verse-key";
import { KNOWN_RANGE_MAX, MAX_AYAH_COUNT } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Body {
  verseKeys?: unknown;
  surahId?: unknown;
  fromAyah?: unknown;
  toAyah?: unknown;
  known?: unknown;
}

/**
 * Labels parts of the Quran as already memorized ("I know this part"), or
 * removes that label. Marking KNOWN skips the hifz process for those verses:
 * they never enter the daily queue and show as fully stable on the map.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    if (typeof body.known !== "boolean") {
      return Response.json({ error: "known must be true or false" }, { status: 400 });
    }

    let verseKeys: string[] = [];

    if (Array.isArray(body.verseKeys)) {
      verseKeys = body.verseKeys.filter((k) => isVerseKey(k));
    } else if (body.surahId !== undefined) {
      const surahId = Number(body.surahId);
      const fromAyah = Number(body.fromAyah ?? 1);
      const toAyah = Number(body.toAyah ?? fromAyah);
      if (
        !Number.isInteger(surahId) ||
        surahId < 1 ||
        surahId > 114 ||
        !Number.isInteger(fromAyah) ||
        !Number.isInteger(toAyah) ||
        fromAyah < 1 ||
        toAyah < fromAyah ||
        // Known-marking is a bulk import (whole surahs are common), so the
        // per-request span cap lands on KNOWN_RANGE_MAX; this ayah bound just
        // rejects impossible verse numbers.
        toAyah > MAX_AYAH_COUNT
      ) {
        return Response.json({ error: "Invalid surah or ayah range" }, { status: 400 });
      }
      const span = toAyah - fromAyah + 1;
      if (span > KNOWN_RANGE_MAX) {
        return Response.json(
          { error: `Mark at most ${KNOWN_RANGE_MAX} verses at a time` },
          { status: 400 }
        );
      }
      verseKeys = Array.from({ length: span }, (_, i) => `${surahId}:${fromAyah + i}`);
    } else {
      return Response.json({ error: "Provide verseKeys or a surah range" }, { status: 400 });
    }

    if (verseKeys.length === 0) {
      return Response.json({ error: "No valid verse keys" }, { status: 400 });
    }
    if (verseKeys.length > KNOWN_RANGE_MAX) {
      return Response.json(
        { error: `Mark at most ${KNOWN_RANGE_MAX} verses at a time` },
        { status: 400 }
      );
    }

    const result = await markKnown({ userId: user.id, verseKeys, known: body.known });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/memory-state]", err);
    return Response.json({ error: "Failed to update your memorization state" }, { status: 500 });
  }
}
