"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-md px-4 text-center">
          <span dir="rtl" lang="ar" className="font-quran block text-5xl text-amber-700 dark:text-amber-400">
            حِفْظ
          </span>
          <h1 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-50">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {error.digest ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
