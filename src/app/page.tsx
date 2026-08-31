import { getAvailableSurahs } from "@/lib/quran/api";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let isGuest = false;
  let available: { id: number; name_arabic: string; name_simple: string; ayah_count: number }[] = [];

  try {
    const [u, g] = await Promise.all([getSessionUser(), isGuestSession()]);
    isGuest = !u && g;
  } catch {
    // DB unavailable — fall through as anonymous
  }

  try {
    available = await getAvailableSurahs();
  } catch {
    available = [];
  }

  return <DashboardView availableSurahs={available} isGuest={isGuest} />;
}
