"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsGuest } from "./GuestContext";

const DISMISS_KEY = "guest-prompt-dismissed";

/** Routes with their own guest explainer; a second banner would double up. */
const OPTED_ROUTES = new Set<string>(["/", "/analytics", "/settings", "/login"]);

export function GuestUpgradePrompt() {
  const isGuest = useIsGuest();
  const pathname = usePathname() ?? "/";
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydration read; SSR cannot see sessionStorage, so the banner renders and immediately resolves its dismissal on mount.
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      // Safari private mode throws on storage access; the banner still shows.
      setDismissed(false);
    }
  }, []);

  if (!isGuest || OPTED_ROUTES.has(pathname) || dismissed) return null;

  return (
    <div className="mb-1 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        You&apos;re in guest mode — memorization progress isn&apos;t saved.{" "}
        <Link href="/login" className="font-medium underline hover:text-amber-900 dark:hover:text-amber-100">
          Sign in
        </Link>{" "}
        to keep it across devices.
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              // Hidden banner still dismisses visually below.
            }
            setDismissed(true);
          }}
          className="ml-auto rounded px-1.5 py-0.5 text-xs text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
          aria-label="Dismiss for this session"
        >
          Not now
        </button>
      </span>
    </div>
  );
}
