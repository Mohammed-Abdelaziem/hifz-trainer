import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

// Exposes only the signed-in email, and exclusively for client hydration of
// SiteHeader: personalized text must never ship in cached server HTML
// (the service worker caches /offline, /blog and /quran shells that used to
// embed it). Response is always cache-bypassed with no-store.
export async function GET() {
  try {
    const user = await getSessionUser();
    return Response.json(
      { email: user?.email ?? null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { email: null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
