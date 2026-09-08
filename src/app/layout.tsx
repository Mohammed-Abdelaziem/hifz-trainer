import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { SwRegister } from "@/components/pwa/SwRegister";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { GuestProvider } from "@/components/auth/GuestContext";
import { getSessionUser } from "@/lib/server/auth";
import { JsonLd } from "@/components/seo/JsonLd";

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
  title: {
    default: "Hifz Trainer — Memorize the Quran with Spaced Repetition",
    template: "%s | Wholly Quran",
  },
  description:
    "Free Quran memorization platform with spaced-repetition scheduling, interactive word-by-word reader, tajweed checker, and progress tracking. Start your hifz journey today.",
  keywords: [
    "quran memorization",
    "hifz trainer",
    "learn quran",
    "tajweed",
    "quran app",
    "memorize quran",
    "spaced repetition quran",
    "quran reader",
    "online quran",
    "free quran app",
  ],
  authors: [{ name: "Wholly Quran" }],
  creator: "Wholly Quran",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://whollyquran.me",
    siteName: "Wholly Quran",
    title: "Hifz Trainer — Memorize the Quran with Spaced Repetition",
    description:
      "Free Quran memorization platform with spaced-repetition scheduling, interactive word-by-word reader, tajweed checker, and progress tracking.",
    images: [
      {
        url: "https://whollyquran.me/api/og?title=Hifz+Trainer&subtitle=Memorize+the+Quran+with+Spaced+Repetition",
        width: 1200,
        height: 630,
        alt: "Wholly Quran — Quran Memorization Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hifz Trainer — Memorize the Quran",
    description:
      "Free Quran memorization platform with spaced-repetition, word-by-word reader, and tajweed checker.",
    images: ["https://whollyquran.me/api/og?title=Hifz+Trainer&subtitle=Memorize+the+Quran+with+Spaced+Repetition"],
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  metadataBase: new URL("https://whollyquran.me"),
};

export const viewport: Viewport = {
  themeColor: "#b45309",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  const isGuest = !user;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${scheherazade.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <Providers>
          <GuestProvider isGuest={isGuest}>
            <OnboardingTour />
            <SiteHeader user={user ? { email: user.email } : null} isGuest={isGuest} />
            <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
            <MobileNav />
            <SwRegister />
          </GuestProvider>
        </Providers>
      </body>
    </html>
  );
}
