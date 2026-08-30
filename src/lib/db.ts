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
  const protocol = encodedUrl.split("://")[0] ?? "none";
  console.log(`[db] createAdapter protocol=${protocol}, urlLength=${encodedUrl.length}`);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(encodedUrl);
  } catch (e) {
    console.error(`[db] FATAL: Cannot parse DATABASE_URL as URL`, e);
    throw new Error(`DATABASE_URL is not a valid URL. Protocol attempted: "${protocol}". Error: ${e}`);
  }

  if (parsedUrl.protocol === "postgres:" || parsedUrl.protocol === "postgresql:") {
    console.log(`[db] Creating PrismaPg adapter, host=${parsedUrl.hostname}, port=${parsedUrl.port}`);
    return new PrismaPg({ connectionString: encodedUrl });
  }

  console.log(`[db] Falling back to PrismaBetterSqlite3 adapter`);
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
    console.log("[db] Running connection test (SELECT 1)...");
    await db.$queryRaw`SELECT 1`;
    console.log("[db] Connection test PASSED");
    globalForPrisma.connectionTested = true;
  } catch (err) {
    console.error("[db] Connection test FAILED:", err);
    console.error("[db] Error name:", (err as Error)?.name);
    console.error("[db] Error message:", (err as Error)?.message);
    console.error("[db] Error code:", (err as any)?.code);
    console.error("[db] Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
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
    console.log(`[db] getDb() initializing. DATABASE_URL is ${rawUrl ? "SET (length=" + rawUrl.length + ")" : "UNDEFINED"}`);
    if (!rawUrl) {
      console.error("[db] WARNING: DATABASE_URL is undefined! Falling back to file:./dev.db");
    }
    const adapter = createAdapter(rawUrl ?? "file:./dev.db");
    console.log("[db] Adapter created, instantiating PrismaClient...");
    globalForPrisma.prisma = new PrismaClient({ adapter });
    console.log("[db] PrismaClient initialized successfully");
  }
  return globalForPrisma.prisma;
}
