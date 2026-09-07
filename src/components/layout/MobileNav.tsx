"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, BookOpen, LayoutDashboard, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/quran", label: "Quran", icon: BookOpen },
  { href: "/reader/1", label: "Hifz", icon: BookMarked },
  { href: "/analytics", label: "Stats", icon: Map },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95 md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
