import { PrismaClient } from "../../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  connectionTested?: boolean;
};

function encodeUrl(rawUrl: string): string {
  const schemeEnd = rawUrl.indexOf("://");
  if (schemeEnd === -1) return rawUrl;
  const scheme = rawUrl.slice(0, schemeEnd + 3);
  const rest = rawUrl.slice(schemeEnd + 3);

  const atIdx = rest.lastIndexOf("@");
  if (atIdx === -1) return rawUrl;

  const userInfo = rest.slice(0, atIdx);
  const hostAndPath = rest.slice(atIdx);

  const colonIdx = userInfo.indexOf(":");
  if (colonIdx === -1) return rawUrl;

  const user = userInfo.slice(0, colonIdx);
  let pass = userInfo.slice(colonIdx + 1);
  pass = pass.replace(/%(?![0-9a-fA-F]{2})/g, "%25");
  pass = pass.replace(/#/g, "%23");

  return `${scheme}${user}:${pass}${hostAndPath}`;
}

function createAdapter(rawUrl: string) {
  const encodedUrl = encodeUrl(rawUrl);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(encodedUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  if (parsedUrl.protocol === "postgres:" || parsedUrl.protocol === "postgresql:") {
    return new PrismaPg({ connectionString: encodedUrl });
  }

  return new PrismaBetterSqlite3({ url: encodedUrl });
}

export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function toAbsoluteUrl(base: string, path: string): string {
  try {
    return new URL(path, base).toString();
  } catch {
    return path;
  }
}

async function testConnection(db: PrismaClient): Promise<void> {
  if (globalForPrisma.connectionTested) return;
  try {
    await db.$queryRaw`SELECT 1`;
    globalForPrisma.connectionTested = true;
  } catch {
    // Connection test failed — will retry on next call
  }
}

export async function getDbWithTest(): Promise<PrismaClient> {
  const db = getDb();
  await testConnection(db);
  return db;
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl && process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production");
    }
    const adapter = createAdapter(rawUrl ?? "file:./dev.db");
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
