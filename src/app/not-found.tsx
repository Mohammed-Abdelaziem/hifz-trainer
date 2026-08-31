import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-14 text-center">
      <span dir="rtl" lang="ar" className="font-quran block text-5xl text-amber-700 dark:text-amber-400">
        ٤٠٤
      </span>
      <h1 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-50">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500"
      >
        Go home
      </Link>
    </div>
  );
}
