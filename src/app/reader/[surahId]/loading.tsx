export default function ReaderLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 pb-48 pt-6" aria-label="Loading surah">
      <div className="mb-5 space-y-3">
        <div className="h-4 w-24 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-10 w-64 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-40 rounded bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="mb-4 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 w-24 rounded-lg bg-stone-100 dark:bg-stone-800" />
        ))}
      </div>
      <div className="space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        {[1.0, 0.9, 0.95, 0.85, 1.0].map((w, i) => (
          <div
            key={i}
            className="mx-auto h-8 rounded bg-stone-100 dark:bg-stone-800"
            style={{ width: `${Math.round(w * 82)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
