import { getSessionUser } from "@/lib/server/auth";
import { recordReading } from "@/lib/server/hifz-service";

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

  if (typeof verseKey !== "string" || !/^\d{1,3}:\d{1,3}$/.test(verseKey)) {
    return Response.json({ error: "verseKey must match 'surah:ayah'" }, { status: 400 });
  }

  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await recordReading({
      userId: user.id,
      verseKey,
      durationMs: typeof durationMs === "number" && Number.isFinite(durationMs) ? durationMs : undefined,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[/api/reading]", err);
    return Response.json({ error: "Failed to record reading" }, { status: 500 });
  }
}
