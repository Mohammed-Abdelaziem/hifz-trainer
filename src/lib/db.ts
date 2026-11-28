import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
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

async function createAdapter(rawUrl: string) {
  const encodedUrl = encodeUrl(rawUrl);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(encodedUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must be a postgres:// or postgresql:// connection string");
  }

  const { PrismaPg } = await import("@prisma/adapter-pg");
  return new PrismaPg({
    connectionString: encodedUrl,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    application_name: "hifz-app",
  });
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

export function toAbsoluteUrl(base: string, path: string): string | null {
  try {
    return new URL(path, base).toString();
  } catch {
    return null;
  }
}

let pendingClient: Promise<PrismaClient> | null = null;

export async function getDb(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set a Postgres connection string."
    );
  }
  if (!pendingClient) {
    pendingClient = (async () => {
      const adapter = await createAdapter(rawUrl);
      return new PrismaClient({ adapter });
    })().catch((err: unknown) => {
      pendingClient = null;
      throw err;
    });
  }
  const client = await pendingClient;
  globalForPrisma.prisma = client;
  return client;
}
