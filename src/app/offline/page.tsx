import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline — Hifz Trainer",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <WifiOff className="h-8 w-8 text-stone-400" />
      </span>
      <h1 className="mt-6 text-xl font-bold">You are offline</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        New pages need a connection, but anything you studied before — verses you opened,
        their audio and word data — is available from cache. Try reloading a surah you
        recently visited.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-amber-600 dark:hover:bg-amber-500"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
