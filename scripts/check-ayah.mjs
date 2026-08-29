import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

const v = await db.verse.findUnique({ where: { verseKey: "36:1" } });
const words = JSON.parse(v.wordsJson);
const cps = [...words[0].text_uthmani].map((ch) => "U+" + ch.codePointAt(0).toString(16).padStart(4, "0"));
writeFileSync(
  ".next/dbcheck.txt",
  `words=${words.length} codepoints=[${cps.join(" ")}] tr=${words[0].translation} tl=${words[0].transliteration} src=${v.wordsSource} rec=${v.recitationUrl}`,
  "utf8"
);
await db.$disconnect();
