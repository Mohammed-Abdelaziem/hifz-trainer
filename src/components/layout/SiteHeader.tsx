"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, BookOpen, LayoutDashboard, LogOut, Map, PenLine, Settings, WifiOff } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/search/SearchBar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/reader/1", label: "Hifz", icon: BookMarked },
  { href: "/analytics", label: "Heatmap", icon: Map },
  { href: "/blog", label: "Blog", icon: PenLine },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SiteHeader({ isGuest }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  // undefined = not yet resolved (no fetch on the server render), null = the
  // session lookup says signed out. Never render the email from server props:
  // this component ships in every page's HTML, including the shells the
  // service worker caches and later serves to a different visitor.
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void fetch("/api/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { email?: string | null } | null) => {
        if (alive) setEmail(data?.email ?? null);
      })
      .catch(() => {
        // Offline or a failed lookup: keep the placeholder rather than
        // clearing a signed-in user's identity.
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 md:gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span dir="rtl" lang="ar" className="font-quran text-xl leading-none text-amber-700 dark:text-amber-400">
            حِفْظ
          </span>
          <span className="hidden sm:inline">Hifz Trainer</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors md:px-3",
                  active
                    ? "bg-stone-900 text-white dark:bg-amber-600"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Outside the user/guest conditional so signed-out visitors get it too. */}
        <ThemeToggle />
        <div className="hidden w-48 md:block">
          <SearchBar />
        </div>
        {/* {user || isGuest ...} used to always render the account block: a null
            user already forced isGuest = true, so the sign-in branch in the
            server version was unreachable. The block stays unconditional; the
            authoritative guest flag from the server layout decides its label. */}
        <div className="flex items-center gap-2 border-l border-stone-200 pl-2 dark:border-stone-700 md:pl-3">
          <span
            title={isGuest ? "Guest mode — progress saved locally" : (email ?? "Loading…")}
            className="hidden max-w-[140px] truncate text-xs text-stone-500 md:inline dark:text-stone-400"
          >
            {isGuest ? "Guest" : (email ?? "…")}
          </span>
          {/* Guests have no session to sign out of, and the label rendered a
              no-op-looking action on every anonymous surface. */}
          {!isGuest && (
            <form action={signOutAction}>
              <button
                type="submit"
                title="Sign out"
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-1 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 md:px-2 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          )}
        </div>
        {offline && (
          <span className="ml-3 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <WifiOff className="h-3 w-3" />
            Offline
          </span>
        )}
      </div>
    </header>
  );
}