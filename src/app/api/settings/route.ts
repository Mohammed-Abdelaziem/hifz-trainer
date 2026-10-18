import { getSessionUser } from "@/lib/server/auth";
import { getDb } from "@/lib/db";
import { MAX_RETENTION, MIN_RETENTION } from "@/lib/srs/fsrs";
import { DEFAULT_RETENTION, DAILY_TARGET_MIN, DAILY_TARGET_MAX } from "@/lib/constants";

export const dynamic = "force-dynamic";

const VALID_SCHEDULERS = new Set(["sm2", "fsrs"]);

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

    const body = (await req.json().catch(() => null)) as
      | { scheduler?: unknown; requestRetention?: unknown; dailyTargetCount?: unknown }
      | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const data: { scheduler?: string; requestRetention?: number; dailyTargetCount?: number } = {};

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

    if (body.dailyTargetCount !== undefined) {
      const count = Number(body.dailyTargetCount);
      if (!Number.isInteger(count) || count < DAILY_TARGET_MIN || count > DAILY_TARGET_MAX) {
        return Response.json(
          { error: `dailyTargetCount must be between ${DAILY_TARGET_MIN} and ${DAILY_TARGET_MAX}` },
          { status: 400 }
        );
      }
      data.dailyTargetCount = count;
    }

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
