import { getSessionUser } from "@/lib/server/auth";
import {
  INTERVAL_BUCKETS,
  buildRecap,
  getReviewStats,
  previousWeekOffset,
} from "@/lib/server/stats-service";
import type { RecapData, ReviewStats } from "@/types/srs";

export const dynamic = "force-dynamic";
export { INTERVAL_BUCKETS, buildRecap, previousWeekOffset };
export type { RecapData, ReviewStats };

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const stats = await getReviewStats(user.id);
    return Response.json(stats);
  } catch (err) {
    console.error("[/api/stats]", err);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
