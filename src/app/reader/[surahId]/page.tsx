import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAvailableSurahs, getSurahBundle } from "@/lib/quran/api";
import { getSessionUser } from "@/lib/server/auth";
import { isGuestSession } from "@/lib/server/guest";
import { ReaderWorkspace } from "@/components/reader/ReaderWorkspace";

type Props = PageProps<'/reader/[surahId]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surahId } = await params;
  const surah = await getSurahBundle(Number(surahId));
  if (!surah) return { title: "Surah not found" };
  return { title: `${surah.name_simple} — Hifz Trainer` };
}

export default async function ReaderPage(props: Props) {
  const [user, guest] = await Promise.all([getSessionUser(), isGuestSession()]);
  const isGuest = !user && guest;
  const [{ surahId }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const id = Number(surahId);
  if (!Number.isInteger(id)) notFound();

  const [surah, navItems] = await Promise.all([getSurahBundle(id), getAvailableSurahs()]);
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
      availableSurahs={navItems.map(({ id: aid, name_simple }) => ({
        id: aid,
        name_simple,
      }))}
    />
  );
}
