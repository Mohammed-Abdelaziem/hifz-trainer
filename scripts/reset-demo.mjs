import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const c = new PrismaClient({
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
