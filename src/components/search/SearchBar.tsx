"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  verseKey: string;
  surahId: number;
  ayahNumber: number;
  snippet: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
          open
            ? "border-amber-400 bg-white ring-2 ring-amber-400/20 dark:border-amber-600 dark:bg-stone-800"
            : "border-stone-200 bg-stone-50 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search verses..."
          className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-stone-100 dark:placeholder:text-stone-500"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-stone-400" />}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
          {results.length === 0 && !loading ? (
            <div className="p-4 text-center text-sm text-stone-500 dark:text-stone-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((r) => (
                <li key={r.verseKey}>
                  <Link
                    href={`/quran?surah=${r.surahId}&verse=${r.verseKey}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {r.verseKey}
                      </span>
                      <span className="text-xs text-stone-400">Ayah {r.ayahNumber}</span>
                    </div>
                    {r.snippet && (
                      <p className="mt-1 text-xs text-stone-600 line-clamp-2 dark:text-stone-400">
                        {r.snippet}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
