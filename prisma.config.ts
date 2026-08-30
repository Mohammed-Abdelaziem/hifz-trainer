import path from "node:path";
import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {}

function encodeDbUrl(raw: string): string {
  const schemeEnd = raw.indexOf("://");
  if (schemeEnd === -1) return raw;
  const scheme = raw.slice(0, schemeEnd + 3);
  const rest = raw.slice(schemeEnd + 3);
  const atIdx = rest.lastIndexOf("@");
  if (atIdx === -1) return raw;
  const userInfo = rest.slice(0, atIdx);
  const hostAndPath = rest.slice(atIdx);
  const colonIdx = userInfo.indexOf(":");
  if (colonIdx === -1) return raw;
  const user = userInfo.slice(0, colonIdx);
  let pass = userInfo.slice(colonIdx + 1);
  pass = pass.replace(/%(?![0-9a-fA-F]{2})/g, "%25");
  pass = pass.replace(/#/g, "%23");
  return `${scheme}${user}:${pass}${hostAndPath}`;
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: encodeDbUrl(env("DATABASE_URL") ?? ""),
  },
});
