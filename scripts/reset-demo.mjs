// Generated client lives in ../generated/prisma; the "@prisma/client" stub
// needs .prisma/client/default, which no longer exists with a custom output.
import prismaPkg from "../generated/prisma/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const c = new prismaPkg.PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

(async () => {
  await c.reviewLog.deleteMany({});
  await c.userMemoryState.deleteMany({});
  await c.user.update({
    where: { email: "demo@hifz.local" },
    data: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
  });
  console.log("cleaned; verses kept:", await c.verse.count());
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => c.$disconnect());
