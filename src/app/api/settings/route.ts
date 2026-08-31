import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { getDb } from "@/lib/db";
import { MAX_RETENTION, MIN_RETENTION } from "@/lib/srs/fsrs";

export const dynamic = "force-dynamic";

const VALID_SCHEDULERS = new Set(["sm2", "fsrs"]);

export async function GET() {
  const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
  if (!user && !guest) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!user) return Response.json({ scheduler: "sm2", requestRetention: 0.9 });
  return Response.json({
    scheduler: user.scheduler === "fsrs" ? "fsrs" : "sm2",
    requestRetention: user.requestRetention ?? 0.9,
  });
}

export async function POST(req: Request) {
  try {
    const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
    if (!user && !guest) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return Response.json({ ok: true, scheduler: "sm2", requestRetention: 0.9 });

    const body = (await req.json().catch(() => null)) as
      | { scheduler?: unknown; requestRetention?: unknown }
      | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const data: { scheduler?: string; requestRetention?: number } = {};

    if (body.scheduler !== undefined) {
      if (typeof body.scheduler !== "string" || !VALID_SCHEDULERS.has(body.scheduler)) {
        return Response.json({ error: "scheduler must be 'sm2' or 'fsrs'" }, { status: 400 });
      }
      data.scheduler = body.scheduler;
    }

    if (body.requestRetention !== undefined) {
      const r = Number(body.requestRetention);
      if (!Number.isFinite(r) || r < MIN_RETENTION || r > MAX_RETENTION) {
        return Response.json(
          { error: `requestRetention must be between ${MIN_RETENTION} and ${MAX_RETENTION}` },
          { status: 400 }
        );
      }
      data.requestRetention = Math.round(r * 100) / 100;
    }

    if (Object.keys(data).length === 0) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }

    const db = await getDb();
    await db.user.update({ where: { id: user.id }, data });

    const updated = await db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { scheduler: true, requestRetention: true },
    });
    return Response.json({
      ok: true,
      scheduler: updated.scheduler === "fsrs" ? "fsrs" : "sm2",
      requestRetention: updated.requestRetention,
    });
  } catch (err) {
    console.error("[/api/settings]", err);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
