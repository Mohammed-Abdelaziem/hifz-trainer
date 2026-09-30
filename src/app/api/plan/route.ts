import { getSessionUser } from "@/lib/server/auth";
import { addToSabaq } from "@/lib/server/hifz-service";
import { SABAQ_BATCH_MAX } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Body {
  verseKeys?: unknown;
  surahId?: unknown;
  fromAyah?: unknown;
  toAyah?: unknown;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    let verseKeys: string[] = [];

    if (Array.isArray(body.verseKeys)) {
      verseKeys = body.verseKeys.filter(
        (k): k is string => typeof k === "string" && /^\d{1,3}:\d{1,3}$/.test(k)
      );
    } else if (body.surahId !== undefined) {
      // Range form: "add 1:1 through 1:10".
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
        // 286 is the largest ayah count in the Quran, so this bounds the range
        // before it becomes a list.
        toAyah > 286
      ) {
        return Response.json({ error: "Invalid surah or ayah range" }, { status: 400 });
      }
      const span = toAyah - fromAyah + 1;
      if (span > SABAQ_BATCH_MAX) {
        return Response.json(
          { error: `Add at most ${SABAQ_BATCH_MAX} verses at a time` },
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
    if (verseKeys.length > SABAQ_BATCH_MAX) {
      return Response.json(
        { error: `Add at most ${SABAQ_BATCH_MAX} verses at a time` },
        { status: 400 }
      );
    }

    const result = await addToSabaq({ userId: user.id, verseKeys });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/plan]", err);
    return Response.json({ error: "Failed to update your plan" }, { status: 500 });
  }
}
