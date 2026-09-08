import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/server/auth";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your Wholly Quran account settings: scheduler preference, retention rate, and daily memorization target.",
  robots: { index: false },
};

export default async function SettingsPage() {
  let user = null;
  try {
    user = await getSessionUser();
  } catch {
    // continue
  }

  if (!user) redirect("/login");

  return (
    <SettingsView
      user={user ? { email: user.email, scheduler: user.scheduler, requestRetention: user.requestRetention, dailyTargetCount: user.dailyTargetCount } : null}
      isGuest={false}
    />
  );
}
