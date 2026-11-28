"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import type { SurahBundle } from "@/types/quran";
import type { SurahProgress } from "@/types/srs";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

interface ReaderHeaderProps {
  surah: SurahBundle;
  progress: SurahProgress | null;
  availableSurahs: { id: number; name_simple: string }[];
  onJumpToAyah: (raw: string) => boolean;
}

export function ReaderHeader({
  surah,
  progress,
  availableSurahs,
  onJumpToAyah,
}: ReaderHeaderProps) {
  const router = useRouter();
  const [jumpInput, setJumpInput] = useState("");

  const idx = availableSurahs.findIndex((s) => s.id === surah.id);
  const prev = idx > 0 ? availableSurahs[idx - 1] : null;
  const next =
    idx >= 0 && idx < availableSurahs.length - 1 ? availableSurahs[idx + 1] : null;

  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 sm:items-center">
        <div>
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="flex items-baseline gap-3">
            <span dir="rtl" lang="ar" className="font-quran text-4xl">
              {surah.name_arabic}
            </span>
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
            <span className="whitespace-nowrap">
              {surah.name_simple} ·{" "}
              {surah.revelation_place === "makkah" ? "Makkan" : "Madinan"} ·{" "}
              {surah.ayah_count} verses
            </span>
            {progress ? (
              (() => {
                const totalVerses =
                  progress.total > 0 ? progress.total : surah.ayah_count;
                const learning = progress.sabaq + progress.sabqi + progress.manzil;
                const fullyKnown = totalVerses > 0 && progress.known >= totalVerses;
                const hasProgress = progress.known > 0 || learning > 0;
                return (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        fullyKnown ? "success" : hasProgress ? "warning" : "secondary"
                      }
                      className="gap-1"
                      title={`${progress.known} known · ${progress.sabaq} new · ${progress.sabqi} recent review · ${progress.manzil} long-term of ${totalVerses} verses`}
                    >
                      <Star className="h-3 w-3" aria-hidden="true" />
                      {progress.known}/{totalVerses} known
                      {learning > 0 ? ` · ${learning} in hifz` : ""}
                    </Badge>
                    {progress.pages &&
                      progress.pages.length > 1 &&
                      (() => {
                        const parts = progress.pages.map((p) => {
                          const share = Math.max(
                            0.03,
                            p.total / Math.max(1, totalVerses)
                          );
                          const tone =
                            p.known === p.total && p.total > 0
                              ? "bg-teal-500 dark:bg-teal-600"
                              : p.known + p.learning > 0
                                ? "bg-amber-400 dark:bg-amber-500"
                                : "bg-stone-300 dark:bg-stone-600";
                          const title = `Page ${p.page}: ${p.total} verse${p.total === 1 ? "" : "s"} · ${p.known} known · ${p.learning} in rotation`;
                          return { p, share, tone, title };
                        });
                        return (
                          <span
                            role="img"
                            aria-label="Per-page memorization progress"
                            title={parts.map((x) => x.title).join(" · ")}
                            className="inline-flex h-1.5 min-w-16 overflow-hidden rounded-full bg-stone-200 align-middle dark:bg-stone-700"
                            style={{ width: 96 }}
                          >
                            {parts.map((x) => (
                              <span
                                key={x.p.page}
                                className={x.tone}
                                style={{ flexGrow: x.share }}
                              />
                            ))}
                          </span>
                        );
                      })()}
                  </span>
                );
              })()
            ) : (
              <Badge variant="secondary">Guest</Badge>
            )}
          </p>
        </div>

        <nav className="flex shrink-0 items-center gap-1.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onJumpToAyah(jumpInput)) {
                setJumpInput("");
              }
            }}
            aria-label="Jump to ayah"
          >
            <input
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ayah…"
              aria-label="Jump to ayah"
              title="Jump to ayah: 7 or surah:ayah like 2:255"
              className="w-28 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
            />
          </form>
          {prev && (
            <Link
              href={`/reader/${prev.id}`}
              title={prev.name_simple}
              className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              ←
            </Link>
          )}
          <Select
            value={String(surah.id)}
            onChange={(e) => {
              router.push(`/reader/${e.target.value}`);
            }}
            aria-label="Switch surah"
            className="max-w-[200px] w-36 sm:w-48"
            options={availableSurahs.map((s) => ({
              value: String(s.id),
              label: `${s.id}. ${s.name_simple}`,
            }))}
          />
          {next && (
            <Link
              href={`/reader/${next.id}`}
              title={next.name_simple}
              className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              →
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
