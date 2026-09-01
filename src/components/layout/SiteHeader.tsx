"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, BookOpen, LayoutDashboard, LogOut, Map, WifiOff } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/reader/1", label: "Hifz", icon: BookMarked },
  { href: "/analytics", label: "Heatmap", icon: Map },
];

export function SiteHeader({ user, isGuest }: { user?: { email: string } | null; isGuest?: boolean }) {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
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
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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
        {user || isGuest ? (
          <>
            <div className="flex items-center gap-2 border-l border-stone-200 pl-3 dark:border-stone-700">
              <span
                title={user?.email ?? "Guest mode — progress saved locally"}
                className="hidden max-w-[140px] truncate text-xs text-stone-500 md:inline dark:text-stone-400"
              >
                {user?.email ?? "Guest"}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
            {offline && (
              <span className="ml-3 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-700 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}