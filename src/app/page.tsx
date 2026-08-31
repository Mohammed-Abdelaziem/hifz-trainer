import { getAvailableSurahs } from "@/lib/quran/api";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
  const isGuest = !user && guest;
  const available = await getAvailableSurahs();
  return <DashboardView availableSurahs={available} isGuest={isGuest} />;
}
