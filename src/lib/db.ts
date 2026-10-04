import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const g = globalThis as { prisma?: PrismaClient };

/**
 * Supabase's Prisma connection strings carry Prisma-engine options (pgbouncer, connection_limit) that
 * node-postgres would pass on to Postgres as unknown settings, so drop them.
 */
function connectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set");
  const url = new URL(raw);
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("connection_limit");
  return url.toString();
}

/** The Prisma client, created on first use. One per server instance, and reused across dev hot reloads. */
export function db(): PrismaClient {
  if (!g.prisma) g.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString(), max: 3 }) });
  return g.prisma;
}
