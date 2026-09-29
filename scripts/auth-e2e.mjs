import { createHash, randomBytes, scrypt } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

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

function hash(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, { N: 65536, r: 8, p: 1 }, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

// Sessions are stored as SHA-256 of the bearer token, so the fixture has to
// write the digest rather than the token itself.
const sessionDigest = (token) => createHash("sha256").update(token).digest("hex");

try {
  if (mode === "setup") {
    const passwordHash = await hash(E2E_PASSWORD);
    const user = await db.user.upsert({
      where: { email: E2E_EMAIL },
      create: { email: E2E_EMAIL, passwordHash, lastPasswordChangedAt: new Date() },
      update: { passwordHash, lastPasswordChangedAt: new Date() },
    });
    await db.session.deleteMany({ where: { userId: user.id } });
    console.log("SETUP OK", user.id);
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
