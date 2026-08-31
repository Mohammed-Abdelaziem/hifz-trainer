import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAvailableSurahs, getSurahBundle } from "@/lib/quran/api";
import { QuranReader } from "@/components/quran/QuranReader";

export const metadata: Metadata = {
  title: "Read Quran — Hifz Trainer",
  description: "Read, listen, and explore the Holy Quran with translations and tafsir.",
};

type Props = {
  searchParams: Promise<{ surah?: string; verse?: string; page?: string }>;
};

export default async function QuranPage(props: Props) {
  const searchParams = await props.searchParams;

  let surahId = 1;
  if (searchParams.surah) {
    const parsed = Number(searchParams.surah);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 114) {
      surahId = parsed;
    }
  }

  if (searchParams.page) {
    const parsed = Number(searchParams.page);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 604) {
      redirect(`/quran?surah=1`);
    }
  }

  let navItems: { id: number; name_simple: string; ayah_count: number }[] = [];
  try {
    navItems = await getAvailableSurahs().then((items) =>
      items.map(({ id, name_simple, ayah_count }) => ({ id, name_simple, ayah_count }))
    );
  } catch {
    // DB unavailable — use empty nav
  }

  let surah = null;
  try {
    surah = await getSurahBundle(surahId);
  } catch {
    // unavailable
  }
  if (!surah) notFound();

  const initialVerseKey = searchParams.verse ?? undefined;

  return (
    <QuranReader
      key={surahId}
      surah={surah}
      initialVerseKey={initialVerseKey}
      availableSurahs={navItems}
    />
  );
}
