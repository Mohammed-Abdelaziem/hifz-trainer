import type { Ayah, SurahBundle, QuranWord } from "@/types/quran";
import { everyAyahUrl, synthTimings } from "@/lib/quran/timings";

interface RawAyah {
  n: number;
  words: [text: string, translation: string, root?: string][];
  tafsir: string;
  translation: string;
}

function buildAyah(surahId: number, raw: RawAyah): Ayah {
  const verse_key = `${surahId}:${raw.n}`;
  const words: QuranWord[] = raw.words.map(([text_uthmani, translation, root], i) => ({
    id: `${verse_key}:${i + 1}`,
    text_uthmani,
    translation,
    root,
  }));
  return {
    ayah_number: raw.n,
    verse_key,
    words,
    audio_url: everyAyahUrl(verse_key),
    timings: synthTimings(words),
    tafsir: raw.tafsir,
    translation: raw.translation,
  };
}

function buildSurah(
  meta: Omit<SurahBundle, "ayahs" | "ayah_count">,
  raw: RawAyah[]
): SurahBundle {
  const ayahs = raw.map((r) => buildAyah(meta.id, r));
  return { ...meta, ayah_count: ayahs.length, ayahs };
}

export const FIXTURE_SURAHS: Record<number, SurahBundle> = {
  1: buildSurah(
    {
      id: 1,
      name_arabic: "سُورَةُ الْفَاتِحَة",
      name_simple: "Al-Fatiha",
      english_name: "The Opener",
      revelation_place: "makkah",
    },
    [
      {
        n: 1,
        words: [
          ["بِسْمِ", "In the name", "س م و"],
          ["اللَّهِ", "of Allah", "ء ل ه"],
          ["الرَّحْمَٰنِ", "the Most Gracious", "ر ح م"],
          ["الرَّحِيمِ", "the Most Merciful", "ر ح م"],
        ],
        tafsir:
          "The Basmalah opens the surah: every recitation begins by invoking Allah's name, which encompasses His mercy — ar-Rahman denoting the universal mercy embracing all creation, ar-Raheem the special mercy for the believers.",
        translation:
          "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      },
      {
        n: 2,
        words: [
          ["الْحَمْدُ", "All praise", "ح م د"],
          ["لِلَّهِ", "is due to Allah", "ء ل ه"],
          ["رَبِّ", "Lord", "ر ب ب"],
          ["الْعَالَمِينَ", "of the worlds", "ع ل م"],
        ],
        tafsir:
          "Hamd combines praise with love and reverence. Rabb (Lord) means the Owner, Sustainer and Nurturer of all existence; 'alameen comprises everything besides Allah — mankind, jinn, angels and all created realms.",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
      },
      {
        n: 3,
        words: [
          ["الرَّحْمَٰنِ", "the Most Gracious", "ر ح م"],
          ["الرَّحِيمِ", "the Most Merciful", "ر ح م"],
        ],
        tafsir:
          "Repetition after mentioning Lordship reassures the servant: the One who governs all affairs does so through mercy before any command or decree.",
        translation: "The Entirely Merciful, the Especially Merciful,",
      },
      {
        n: 4,
        words: [
          ["مَالِكِ", "Master", "م ل ك"],
          ["يَوْمِ", "of the Day", "ي و م"],
          ["الدِّينِ", "of Recompense", "د ي ن"],
        ],
        tafsir:
          "Sovereignty is attributed specifically to the Day of Judgement because on that day no one claims dominion beside Him; all worldly kings surrender their crowns and He alone judges.",
        translation: "Sovereign of the Day of Recompense.",
      },
      {
        n: 5,
        words: [
          ["إِيَّاكَ", "You alone", "ء ي ي"],
          ["نَعْبُدُ", "we worship", "ع ب د"],
          ["وَإِيَّاكَ", "and You alone", "ء ي ي"],
          ["نَسْتَعِينُ", "we ask for help", "ع و ن"],
        ],
        tafsir:
          "Placing iyyaka (You alone) before the verb restricts worship and seeking aid to Allah exclusively. Worship is the right He deserves; istiana (seeking help) is the acknowledgment that nothing is achieved without Him.",
        translation: "It is You we worship and You we ask for help.",
      },
      {
        n: 6,
        words: [
          ["اهْدِنَا", "Guide us", "ه د ي"],
          ["الصِّرَاطَ", "to the path", "س ر ط"],
          ["الْمُسْتَقِيمَ", "the straight", "ق و م"],
        ],
        tafsir:
          "Hidayah here means both the knowledge of the truth and the steadfastness upon it. As-sirat al-mustaqim is the clear path leading straight to Allah's pleasure — Islam itself.",
        translation: "Guide us to the straight path -",
      },
      {
        n: 7,
        words: [
          ["صِرَاطَ", "The path", "س ر ط"],
          ["الَّذِينَ", "of those", "ا ل ذ ي"],
          ["أَنْعَمْتَ", "You have favored", "ن ع م"],
          ["عَلَيْهِمْ", "upon them", "ع ل و"],
          ["غَيْرِ", "not of", "غ ي ر"],
          ["الْمَغْضُوبِ", "those who earned anger", "غ ض ب"],
          ["عَلَيْهِمْ", "upon them", "ع ل و"],
          ["وَلَا", "and nor", "و ل ا"],
          ["الضَّالِّينَ", "those astray", "ض ل ل"],
        ],
        tafsir:
          "The favored are the prophets, the truthful, the martyrs and the righteous. Those who earned anger knew the truth yet abandoned it; those astray worshipped without knowledge. The surah teaches us to ask for guidance away from both extremes.",
        translation:
          "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      },
    ]
  ),
  112: buildSurah(
    {
      id: 112,
      name_arabic: "سُورَةُ الْإِخْلَاص",
      name_simple: "Al-Ikhlas",
      english_name: "The Sincerity",
      revelation_place: "makkah",
    },
    [
      {
        n: 1,
        words: [
          ["قُلْ", "Say", "ق و ل"],
          ["هُوَ", "He", "ه و ء"],
          ["اللَّهُ", "(is) Allah", "ء ل ه"],
          ["أَحَدٌ", "the One", "ء ح د"],
        ],
        tafsir:
          "Commanded to answer the question about his Lord's identity, the Prophet ﷺ declares: He is Allah, uniquely One — ahad negating plurality, partners, likeness and composition.",
        translation: 'Say, "He is Allah, [who is] One,',
      },
      {
        n: 2,
        words: [
          ["اللَّهُ", "Allah", "ء ل ه"],
          ["الصَّمَدُ", "the Eternal Refuge", "ص م د"],
        ],
        tafsir:
          "As-Samad: the Master who is perfect in every attribute, sought by all creation in their needs, while He needs none — neither eating, drinking, sleeping nor progeny.",
        translation: "Allah, the Eternal Refuge.",
      },
      {
        n: 3,
        words: [
          ["لَمْ", "He did not", "ل م"],
          ["يَلِدْ", "beget", "و ل د"],
          ["وَلَمْ", "nor was He", "ل م"],
          ["يُولَدْ", "begotten", "و ل د"],
        ],
        tafsir:
          "He has no child, no parent and no equal. Begetting implies resemblance to created things and neediness, both impossible for the Perfect Creator.",
        translation: "He neither begets nor is born,",
      },
      {
        n: 4,
        words: [
          ["وَلَمْ", "And never has", "ل م"],
          ["يَكُن", "there been", "ك و ن"],
          ["لَّهُ", "for Him", "ء ل ه"],
          ["كُفُوًا", "any equivalent", "ك ف ء"],
          ["أَحَدٌ", "anyone", "ء ح د"],
        ],
        tafsir:
          "Kufuwan ahad: absolutely no one resembles Him in essence, attributes or deeds. This surah equals one third of the Qur'an because it encapsulates Tawhid — the central message every other theme serves.",
        translation: "Nor is there to Him any equivalent.",
      },
    ]
  ),
};
