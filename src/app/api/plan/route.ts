import { getSessionUser } from "@/lib/server/auth";
import { addToSabaq } from "@/lib/server/hifz-service";
import { parseVerseSelection, type VerseSelectionBody } from "@/lib/server/validation";
import { SABAQ_BATCH_MAX } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as VerseSelectionBody | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const selection = parseVerseSelection(body, { maxCount: SABAQ_BATCH_MAX, verb: "Add" });
    if (!selection.ok) {
      return Response.json({ error: selection.error }, { status: 400 });
    }

    const result = await addToSabaq({ userId: user.id, verseKeys: selection.verseKeys });
    if (result.invalid > 0 && result.added === 0 && result.duplicate === 0) {
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
    console.error("[/api/plan]", err);
    return Response.json({ error: "Failed to update your plan" }, { status: 500 });
  }
}
