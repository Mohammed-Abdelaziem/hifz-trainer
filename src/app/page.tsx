import type { Metadata } from "next";
import { getAvailableSurahs } from "@/lib/quran/api";
import { getSessionUser } from "@/lib/server/auth";
import { SITE_URL } from "@/lib/server/site-url";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { GuestLanding } from "@/components/landing/GuestLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quran Memorization Dashboard — Track Your Hifz Journey",
  description:
    "Your personalized Quran memorization dashboard. Track sabaq, sabqi, and manzil reviews with spaced-repetition scheduling. Monitor daily progress and stay consistent.",
  openGraph: {
    title: "Hifz Trainer — Quran Memorization Dashboard",
    description:
      "Track your Quran memorization with spaced-repetition. Sabaq intake, Sabqi review, Manzil rotation.",
    url: SITE_URL,
  },
};

export default async function HomePage() {
  let user = null;
  let available: { id: number; name_arabic: string; name_simple: string; ayah_count: number }[] = [];

  try {
    user = await getSessionUser();
  } catch {
    // DB unavailable — fall through as anonymous
  }

  try {
    available = await getAvailableSurahs();
  } catch {
    available = [];
  }

  if (!user) {
    return <GuestLanding />;
  }

  return (
    <DashboardView
      availableSurahs={available}
      isGuest={false}
      isAdmin={user.role === "admin"}
    />
  );
}
