import { defineConfig } from "prisma/config";

// Prisma doesn't read .env files itself. Load .env.local when it exists (local dev); on Netlify the
// variables are already in the environment.
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrations need a direct (session) connection, not the transaction pooler the app uses.
  // `prisma generate` doesn't connect, so builds work without it.
  datasource: { url: process.env.DIRECT_URL ?? "" },
});
