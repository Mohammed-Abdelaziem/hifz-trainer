import { randomBytes, scrypt } from "node:crypto";
// Import the generated client from its configured output directory. The
// "@prisma/client" entry point resolves to a stub that needs
// ".prisma/client/default", which only exists when the client is generated
// into node_modules rather than ../generated/prisma.
import prismaPkg from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const { PrismaClient } = prismaPkg;

// Matches the fixtures in e2e/*.spec.ts. Keep the three in sync.
export const E2E_EMAIL = "auth-test@example.com";
export const E2E_PASSWORD = "testpass12345";

const mode = process.argv[2] ?? "setup";
const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";

function createDb() {
  return rawUrl.startsWith("postgres")
    ? new PrismaClient({ adapter: new PrismaPg({ connectionString: rawUrl, max: 2 }) })
    : new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: rawUrl }) });
}

const db = createDb();

// maxmem must match SCRYPT_OPTIONS in src/lib/server/auth.ts. OpenSSL's 32MB
// default is below what N=65536,r=8 requires (128*N*r = 64MB), so scrypt
// throws "memory limit exceeded" without it.
const SCRYPT_OPTIONS = { N: 65536, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

function hash(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, SCRYPT_OPTIONS, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

// Al-Fatiha, enough for the reader specs to open a surah and rate a verse.
// Reviews carry a foreign key to Verse, so rating anything in a database with
// no corpus rows fails with ForeignKeyConstraintViolation and the reader shows
// "Server error - review queued" instead of the grade.
const SEED_VERSES = [
  ["1:1", "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "In the name of Allah, the Entirely Merciful, the Especially Merciful."],
  ["1:2", "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", "[All] praise is [due] to Allah, Lord of the worlds -"],
  ["1:3", "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "The Entirely Merciful, the Especially Merciful,"],
  ["1:4", "مَٰلِكِ يَوْمِ ٱلدِّينِ", "Sovereign of the Day of Recompense."],
  ["1:5", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "It is You we worship and You we ask for help."],
  ["1:6", "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "Guide us to the straight path -"],
  ["1:7", "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray."],
];

function verseKeyToParts(verseKey) {
  const [surahId, ayahNumber] = verseKey.split(":").map(Number);
  return { surahId, ayahNumber };
}

async function seedVerses() {
  for (const [verseKey, uthmaniText, translation] of SEED_VERSES) {
    const { surahId, ayahNumber } = verseKeyToParts(verseKey);
    const data = {
      surahId,
      ayahNumber,
      pageNumber: 1,
      uthmaniText,
      translation,
      audioUrl: `https://example.com/${verseKey}.mp3`,
      timestampsJson: "[]",
      wordsJson: JSON.stringify([
        { text_uthmani: uthmaniText, translation, transliteration: "" },
      ]),
    };
    await db.verse.upsert({ where: { verseKey }, create: { verseKey, ...data }, update: data });
  }
}

try {
  if (mode === "setup") {
    const passwordHash = await hash(E2E_PASSWORD);
    const user = await db.user.upsert({
      where: { email: E2E_EMAIL },
      create: { email: E2E_EMAIL, passwordHash, lastPasswordChangedAt: new Date() },
      update: { passwordHash, lastPasswordChangedAt: new Date() },
    });
    await db.session.deleteMany({ where: { userId: user.id } });
    await seedVerses();
    console.log("SETUP OK", user.id, SEED_VERSES.length, "verses");
  } else {
    const u = await db.user.findUnique({ where: { email: E2E_EMAIL } });
    if (u) {
      await db.user.delete({ where: { id: u.id } });
    }
    console.log("CLEANUP OK");
  }
} finally {
  await db.$disconnect();
}
