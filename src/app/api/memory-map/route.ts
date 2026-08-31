import { buildMemoryMap } from "@/lib/server/hifz-service";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [user] = await Promise.all([getSessionUser(), isGuestSession()]);
    if (!user) return Response.json({ verses: [] });
    const verses = await buildMemoryMap(user.id);
    return Response.json({ verses });
  } catch (err) {
    console.error("[/api/memory-map]", err);
    return Response.json({ error: "Failed to load memory map" }, { status: 500 });
  }
}
