import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAvailableSurahs, getSurahBundle } from "@/lib/quran/api";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { ReaderWorkspace } from "@/components/reader/ReaderWorkspace";

type Props = PageProps<'/reader/[surahId]'>;

const REVELATION_LABEL: Record<string, string> = {
  makkah: "Meccan",
  madinah: "Medinan",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { surahId } = await params;
    const surah = await getSurahBundle(Number(surahId));
    if (!surah) return { title: "Surah not found" };

    const revelation = REVELATION_LABEL[surah.revelation_place] ?? surah.revelation_place;
    const title = `${surah.name_simple} (${surah.name_arabic}) — Surah ${surah.id}`;
    const description = `Read and memorize Surah ${surah.name_simple}, the ${surah.english_name} (${revelation}). ${surah.ayah_count} ayahs with word-by-word Arabic text, English translation, and spaced-repetition memorization tools.`;

    return {
      title,
      description,
      keywords: [
        `surah ${surah.name_simple.toLowerCase()}`,
        `surah ${surah.id} quran`,
        `${surah.english_name.toLowerCase()} quran`,
        "read quran",
        "memorize quran",
        "quran hifz",
        "spaced repetition quran",
      ],
      openGraph: {
        title: `${surah.name_simple} — Wholly Quran`,
        description,
        url: `https://whollyquran.me/reader/${surah.id}`,
      },
      twitter: {
        title: `${surah.name_simple} — Wholly Quran`,
        description,
      },
    };
  } catch {
    return { title: "Hifz Trainer" };
  }
}

export default async function ReaderPage(props: Props) {
  let user = null;
  let isGuest = false;
  try {
    const [u, g] = await Promise.all([getSessionUser(), isGuestSession()]);
    user = u;
    isGuest = !u && g;
  } catch {
    // DB unavailable — continue as anonymous
  }

  const [{ surahId }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const id = Number(surahId);
  if (!Number.isInteger(id)) notFound();

  let surah = null;
  let navItems: { id: number; name_simple: string }[] = [];
  try {
    [surah, navItems] = await Promise.all([
      getSurahBundle(id),
      getAvailableSurahs().then((items) =>
        items.map(({ id: aid, name_simple }) => ({ id: aid, name_simple }))
      ),
    ]);
  } catch {
    // DB unavailable
  }

  if (!surah) notFound();

  const verseParam = (await searchParams).verse;
  const initialVerseKey = typeof verseParam === "string" ? verseParam : undefined;

  return (
    <ReaderWorkspace
      key={id}
      surah={surah}
      initialVerseKey={initialVerseKey}
      scheduler={isGuest ? "sm2" : (user?.scheduler === "fsrs" ? "fsrs" : "sm2")}
      requestRetention={isGuest ? 0.9 : (user?.requestRetention ?? 0.9)}
      isGuest={isGuest}
      availableSurahs={navItems}
    />
  );
}
