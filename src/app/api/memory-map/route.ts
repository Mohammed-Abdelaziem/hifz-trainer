import { buildMemoryMap } from "@/lib/server/hifz-service";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const verses = await buildMemoryMap(user.id);
    return Response.json({ verses });
  } catch (err) {
    console.error("[/api/memory-map]", err);
    return Response.json({ error: "Failed to load memory map" }, { status: 500 });
  }
}
