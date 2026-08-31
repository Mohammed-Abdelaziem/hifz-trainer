import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SwRegister } from "@/components/pwa/SwRegister";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { GuestProvider } from "@/components/auth/GuestContext";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hifz Trainer — Quran Memorization Platform",
  description:
    "Spaced-repetition driven Quran memorization: Sabaq intake, Sabqi recent review, Manzil long-term rotation.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#b45309",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
  const isGuest = !user && guest;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${scheherazade.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <GuestProvider isGuest={isGuest}>
            <OnboardingTour />
            <SiteHeader user={user ? { email: user.email } : null} isGuest={isGuest} />
            <main className="flex flex-1 flex-col">{children}</main>
            <SwRegister />
          </GuestProvider>
        </Providers>
      </body>
    </html>
  );
}
