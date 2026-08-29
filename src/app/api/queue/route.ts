import { buildDailyQueue } from "@/lib/server/hifz-service";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const queue = await buildDailyQueue(user.id);
    return Response.json(queue);
  } catch (err) {
    console.error("[/api/queue]", err);
    return Response.json({ error: "Failed to load queue" }, { status: 500 });
  }
}
