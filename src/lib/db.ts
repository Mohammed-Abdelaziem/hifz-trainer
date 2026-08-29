import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createAdapter(url: string) {
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return new PrismaPg({ connectionString: url });
  }
  return new PrismaBetterSqlite3({ url });
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL ?? "file:./dev.db";
    globalForPrisma.prisma = new PrismaClient({ adapter: createAdapter(url) });
  }
  return globalForPrisma.prisma;
}
