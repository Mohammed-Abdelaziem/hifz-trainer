import { buildDailyQueue } from "@/lib/server/hifz-service";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

export const dynamic = "force-dynamic";

const EMPTY_QUEUE = {
  sabaq: [],
  sabqi: [],
  manzil: [],
  estimatedMinutes: 0,
  scheduler: "sm2" as const,
  requestRetention: 0.9,
  streak: { current: 0, longest: 0, dailyTargetCount: 5, todayReviewed: 0 },
};

export async function GET() {
  try {
    const [user] = await Promise.all([getSessionUser(), isGuestSession()]);
    if (!user) return Response.json(EMPTY_QUEUE);
    const queue = await buildDailyQueue(user.id);
    return Response.json(queue);
  } catch (err) {
    console.error("[/api/queue]", err);
    return Response.json(EMPTY_QUEUE);
  }
}
