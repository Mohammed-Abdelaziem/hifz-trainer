import { getSessionUser } from "@/lib/server/auth";
import { markKnown } from "@/lib/server/hifz-service";
import { parseVerseSelection, type VerseSelectionBody } from "@/lib/server/validation";
import { KNOWN_RANGE_MAX } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface Body extends VerseSelectionBody {
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

    const selection = parseVerseSelection(body, { maxCount: KNOWN_RANGE_MAX, verb: "Mark" });
    if (!selection.ok) {
      return Response.json({ error: selection.error }, { status: 400 });
    }

    const result = await markKnown({
      userId: user.id,
      verseKeys: selection.verseKeys,
      known: body.known,
    });
    if (
      body.known &&
      result.invalid > 0 &&
      result.created === 0 &&
      result.changed === 0 &&
      result.alreadyKnown === 0
    ) {
      return Response.json(
        {
          error: "Could not find or sync those verses in the database. Please try again.",
          ...result,
        },
        { status: 422 }
      );
    }
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/memory-state]", err);
    return Response.json({ error: "Failed to update your memorization state" }, { status: 500 });
  }
}
