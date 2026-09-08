import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your Wholly Quran account settings: scheduler preference, retention rate, and daily memorization target.",
  robots: { index: false },
};

export default async function SettingsPage() {
  let user = null;
  let isGuest = false;
  try {
    const [u, g] = await Promise.all([getSessionUser(), isGuestSession()]);
    user = u;
    isGuest = !u && g;
  } catch {
    // continue
  }

  if (!user && !isGuest) redirect("/login");

  return (
    <SettingsView
      user={user ? { email: user.email, scheduler: user.scheduler, requestRetention: user.requestRetention, dailyTargetCount: user.dailyTargetCount } : null}
      isGuest={isGuest}
    />
  );
}
