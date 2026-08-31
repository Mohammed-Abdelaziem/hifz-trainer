import { buildMemoryMap } from "@/lib/server/hifz-service";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
    if (!user && !guest) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return Response.json({ verses: [] });
    const verses = await buildMemoryMap(user.id);
    return Response.json({ verses });
  } catch (err) {
    console.error("[/api/memory-map]", err);
    return Response.json({ error: "Failed to load memory map" }, { status: 500 });
  }
}
