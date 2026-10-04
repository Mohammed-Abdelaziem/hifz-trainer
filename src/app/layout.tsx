import type { Metadata, Viewport } from "next";
import { unstable_rethrow } from "next/navigation";
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
    "Free Quran memorization platform with spaced-repetition scheduling, an interactive word-by-word reader with per-word audio highlighting, and progress tracking. Start your hifz journey today.",
  keywords: [
    "quran memorization",
    "hifz trainer",
    "learn quran",
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
      "Free Quran memorization platform with spaced-repetition scheduling, an interactive word-by-word reader with per-word audio highlighting, and progress tracking.",
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
      "Free Quran memorization platform with spaced-repetition, a word-by-word reader with per-word audio highlighting, and progress tracking.",
    images: ["https://whollyquran.me/api/og?title=Hifz+Trainer&subtitle=Memorize+the+Quran+with+Spaced+Repetition"],
  },
  manifest: "/manifest.webmanifest",
  // Raster icons are required for installability: Chrome wants a >=192px PNG
  // and iOS ignores manifest SVG icons for the home screen entirely.
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Without this, "Add to Home Screen" on iOS opens Safari chrome rather than a
  // standalone window.
  appleWebApp: { capable: true, title: "Hifz Trainer", statusBarStyle: "black-translucent" },
  metadataBase: new URL("https://whollyquran.me"),
};

export const viewport: Viewport = {
  themeColor: "#b45309",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The layout wraps every page, so an unhandled throw here turns any transient
  // database hiccup into a 500 on the whole site — React reports it as a
  // Server Components render error (#441) with no message in production.
  // Degrade to a signed-out render instead; the pages that need a session
  // still guard their own data.
  let user = null;
  try {
    user = await getSessionUser();
  } catch (err) {
    // Next.js signals "this route must be rendered dynamically" by throwing a
    // DynamicServerError out of cookies(). That is control flow, not a
    // failure, so it has to keep propagating; swallowing it both silences the
    // real cause and lets Next try to prerender a route that cannot be.
    unstable_rethrow(err);
    console.warn("[layout] session lookup failed, rendering signed out", err);
  }
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
