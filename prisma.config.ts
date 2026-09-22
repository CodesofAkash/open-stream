import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma 7 no longer reads .env on its own, and connection URLs are no longer
// allowed in schema.prisma — they live here instead (P1012).
loadEnv({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",

  // Migrations and introspection connect directly, bypassing the pooler.
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  },

  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
