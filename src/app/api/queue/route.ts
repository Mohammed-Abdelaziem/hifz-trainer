import { buildDailyQueue } from "@/lib/server/hifz-service";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
    if (!user && !guest) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return Response.json({ sabaq: [], sabqi: [], manzil: [] });
    const queue = await buildDailyQueue(user.id);
    return Response.json(queue);
  } catch (err) {
    console.error("[/api/queue]", err);
    return Response.json({ error: "Failed to load queue" }, { status: 500 });
  }
}
