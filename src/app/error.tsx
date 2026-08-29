"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </span>
      <h1 className="mt-6 text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        An unexpected error interrupted the session. Your progress is saved — try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-amber-600 dark:hover:bg-amber-500"
      >
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
      {error.digest && (
        <p className="mt-3 text-[11px] tabular-nums text-stone-400">ref: {error.digest}</p>
      )}
    </div>
  );
}
