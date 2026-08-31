import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { AuthForms } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Sign in — Hifz Trainer",
};

export default async function LoginPage() {
  const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
  if (user || guest) redirect("/");

  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 py-14">
      <div className="mb-8 text-center">
        <span dir="rtl" lang="ar" className="font-quran block text-5xl leading-none text-amber-700 dark:text-amber-400">
          حِفْظ
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Hifz Trainer</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">
          Spaced-repetition Quran memorization. Your sabaq, sabqi and manzil progress is tracked
          per account.
        </p>
      </div>
      <AuthForms />
    </div>
  );
}
