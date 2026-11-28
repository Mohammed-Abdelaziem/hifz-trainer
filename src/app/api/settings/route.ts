import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";
import { validateProfileSettings } from "@/lib/server/validation";
import { DEFAULT_RETENTION } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    return Response.json({
      scheduler: user.scheduler === "fsrs" ? "fsrs" : "sm2",
      requestRetention: user.requestRetention ?? DEFAULT_RETENTION,
      dailyTargetCount: user.dailyTargetCount,
    });
  } catch (err) {
    console.error("[/api/settings]", err);
    return Response.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const validated = validateProfileSettings(body);
    if (!validated.ok) {
      return Response.json({ error: validated.error }, { status: 400 });
    }

    const { data } = validated;
    if (Object.keys(data).length === 0) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }

    const db = await getDb();
    await db.user.update({ where: { id: user.id }, data });

    const updated = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { scheduler: true, requestRetention: true, dailyTargetCount: true },
    });
    return Response.json({
      ok: true,
      scheduler: updated.scheduler === "fsrs" ? "fsrs" : "sm2",
      requestRetention: updated.requestRetention,
      dailyTargetCount: updated.dailyTargetCount,
    });
  } catch (err) {
    console.error("[/api/settings]", err);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
