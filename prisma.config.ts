import path from "node:path";
import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});
