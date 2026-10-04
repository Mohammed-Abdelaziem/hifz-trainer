/**
 * Grants or revokes the admin role.
 *
 * The admin role gates POST /api/sync, which runs the full 6,236-verse import
 * and the word-enrichment fan-out. That is far too expensive to leave open to
 * every signed-in user, but there is deliberately no admin UI and no signup
 * path that grants the role — so this script is how it is assigned.
 *
 * Usage:
 *   node scripts/set-admin.mjs grant you@example.com
 *   node scripts/set-admin.mjs revoke you@example.com
 *   node scripts/set-admin.mjs list
 *
 * Reads DATABASE_URL from the environment or .env. Safe to re-run.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
// Prisma 7 ships a CommonJS client, so a named ESM import fails at runtime
// with "Named export 'PrismaClient' not found". Take it off the default.
import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const { PrismaClient } = prismaPkg;

function loadEnv() {
  try {
    for (const line of readFileSync(path.join(process.cwd(), ".env"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch {
    // No .env; rely on the ambient environment.
  }
}

loadEnv();

const rawUrl = process.env.DATABASE_URL ?? "";
if (!rawUrl) {
  console.error("DATABASE_URL is not set. Export it or add it to .env.");
  process.exit(1);
}

const db = rawUrl.startsWith("postgres")
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString: rawUrl, max: 2 }) })
  : new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: rawUrl }) });

const [command, email] = process.argv.slice(2);

try {
  if (command === "list") {
    const admins = await db.user.findMany({
      where: { role: "admin" },
      select: { email: true, role: true },
      orderBy: { email: "asc" },
    });
    if (admins.length === 0) {
      console.log("No admins. Grant one with: node scripts/set-admin.mjs grant you@example.com");
    } else {
      for (const a of admins) console.log(`${a.email}\t${a.role}`);
    }
  } else if (command === "grant" || command === "revoke") {
    if (!email) {
      console.error(`Usage: node scripts/set-admin.mjs ${command} you@example.com`);
      process.exit(1);
    }
    const normalized = email.trim().toLowerCase();
    const user = await db.user.findUnique({ where: { email: normalized } });
    if (!user) {
      console.error(`No user with email ${normalized}. Sign up first, then re-run.`);
      process.exit(1);
    }
    const role = command === "grant" ? "admin" : "user";
    await db.user.update({ where: { id: user.id }, data: { role } });
    console.log(`${normalized} is now ${role}.`);
  } else {
    console.error("Usage: node scripts/set-admin.mjs <grant|revoke|list> [email]");
    process.exit(1);
  }
} finally {
  await db.$disconnect();
}
