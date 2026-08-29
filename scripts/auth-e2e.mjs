import { randomBytes, scrypt } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const mode = process.argv[2] ?? "setup";
const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

function hash(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

try {
  if (mode === "setup") {
    const passwordHash = await hash("testpass123");
    const user = await db.user.upsert({
      where: { email: "auth-test@example.com" },
      create: { email: "auth-test@example.com", passwordHash },
      update: { passwordHash },
    });
    await db.session.deleteMany({ where: { userId: user.id } });
    await db.session.create({
      data: {
        token: "e2etest-token-abc123",
        userId: user.id,
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });
    console.log("SETUP OK", user.id);
  } else {
    await db.session.deleteMany({ where: { token: "e2etest-token-abc123" } });
    const u = await db.user.findUnique({ where: { email: "auth-test@example.com" } });
    if (u) {
      await db.user.delete({ where: { id: u.id } });
    }
    console.log("CLEANUP OK");
  }
} finally {
  await db.$disconnect();
}
