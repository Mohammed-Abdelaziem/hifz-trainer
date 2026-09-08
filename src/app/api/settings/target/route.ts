import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { dailyTargetCount?: unknown } | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const raw = body.dailyTargetCount;
    if (raw === undefined) return Response.json({ error: "Nothing to update" }, { status: 400 });

    const count = Number(raw);
    if (!Number.isInteger(count) || count < 5 || count > 50) {
      return Response.json({ error: "dailyTargetCount must be between 5 and 50" }, { status: 400 });
    }

    const db = await getDb();
    await db.user.update({ where: { id: user.id }, data: { dailyTargetCount: count } });
    return Response.json({ ok: true, dailyTargetCount: count });
  } catch (err) {
    console.error("[/api/settings/target]", err);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
