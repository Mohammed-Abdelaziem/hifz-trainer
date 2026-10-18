import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getAvailableSurahs, getSurahBundle } from "@/lib/quran/api";
import { SITE_URL } from "@/lib/server/site-url";
import { QuranReader } from "@/components/quran/QuranReader";

export const metadata: Metadata = {
  title: "Read Quran Online — Full Arabic Text with Translations",
  description:
    "Read, listen, and explore the Holy Quran with word-by-word Arabic text, English translations, and tafsir. Choose from 10 reciters including Mishary Alafasy and Abdul Basit.",
  keywords: [
    "read quran online",
    "quran arabic text",
    "quran translation",
    "quran tafsir",
    "listen to quran",
    "quran reciters",
  ],
  openGraph: {
    title: "Read Quran Online — Wholly Quran",
    description:
      "Read, listen, and explore the Holy Quran with word-by-word Arabic text, English translations, and tafsir.",
    url: `${SITE_URL}/quran`,
  },
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

  // Legacy /quran?page=N links (mushaf page numbers) used to hard-land on
  // surah 1, throwing away the requested page. Map the page number to its
  // first verse and land the reader there instead.
  if (searchParams.page) {
    const page = Number(searchParams.page);
    const valid = Number.isInteger(page) && page >= 1 && page <= 604;
    let first: { surahId: number; verseKey: string } | null = null;
    if (valid) {
      try {
        const db = await getDb();
        first = await db.verse.findFirst({
          where: { pageNumber: page },
          select: { surahId: true, verseKey: true },
          orderBy: [{ surahId: "asc" }, { ayahNumber: "asc" }],
        });
      } catch {
        first = null;
      }
    }
    // redirect() throws by design — keep it outside the try above.
    if (first) redirect(`/quran?surah=${first.surahId}&verse=${first.verseKey}`);
    redirect("/quran?surah=1");
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
