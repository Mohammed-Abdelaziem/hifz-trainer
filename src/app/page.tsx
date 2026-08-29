import { getAvailableSurahs } from "@/lib/quran/api";
import { requirePageUser } from "@/lib/server/auth";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requirePageUser();
  const available = await getAvailableSurahs();
  return <DashboardView availableSurahs={available} />;
}
