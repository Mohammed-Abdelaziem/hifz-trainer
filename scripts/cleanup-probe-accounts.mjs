/**
 * One-off maintenance: delete the leftover probe accounts created while
 * reproducing production issues (emails like "probe-*@example.com").
 *
 * Run with DATABASE_URL pointing at the production database:
 *   node scripts/cleanup-probe-accounts.mjs      # lists matches (dry run)
 *   node scripts/cleanup-probe-accounts.mjs --yes # deletes them
 *
 * Deletions rely on the schema's relational cascade; any user with
 * non-cascading progress rows is reported and skipped rather than half-deleted.
 */
import { PrismaClient } from "@prisma/client";

const CONFIRM = process.argv.includes("--yes");
const prisma = new PrismaClient();

const probes = await prisma.user.findMany({
  where: { email: { startsWith: "probe-" } },
  select: { id: true, email: true, createdAt: true },
});

if (probes.length === 0) {
  console.log("No probe-* accounts found — nothing to do.");
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`Found ${probes.length} probe account(s):`);
for (const u of probes) console.log(`  ${u.email} (created ${u.createdAt?.toISOString?.() ?? u.createdAt})`);

if (!CONFIRM) {
  console.log("\nDry run only — re-run with --yes to delete.");
  await prisma.$disconnect();
  process.exit(0);
}

let deleted = 0;
for (const u of probes) {
  try {
    await prisma.user.delete({ where: { id: u.id } });
    deleted += 1;
  } catch (err) {
    console.error(`Could not delete ${u.email}:`, err instanceof Error ? err.message : err);
  }
}
console.log(`Deleted ${deleted}/${probes.length} probe account(s).`);
await prisma.$disconnect();
