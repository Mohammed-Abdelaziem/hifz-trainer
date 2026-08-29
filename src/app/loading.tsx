export default function RootLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-600 dark:border-stone-700 dark:border-t-amber-500" />
    </div>
  );
}
