import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const db = await getDb();

    // Distinct verse keys, not rows: a row per (userId, verseKey) is unique by
    // schema, but counting rows would still be the wrong question if the
    // schema ever relaxes. The corpus total anchors what "the whole Quran"
    // means to THIS deployment — a partial-corpus environment (tests, staging)
    // stays self-consistent instead of claiming a false remaining count.
    const [memorized, total] = await Promise.all([
      db.userMemoryState.count({ where: { userId: user.id } }),
      db.verse.count(),
    ]);
    return Response.json({ memorized, total });
  } catch (err) {
    console.error("[/api/pace]", err);
    return Response.json({ error: "Failed to load pace data" }, { status: 500 });
  }
}
