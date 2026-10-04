import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const g = globalThis as { prisma?: PrismaClient };

function connectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set");
  if (!URL.canParse(raw)) throw new Error("DATABASE_URL is not a valid postgres:// URL");
  const url = new URL(raw);
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("connection_limit");
  return url.toString();
}

export function db(): PrismaClient {
  if (!g.prisma) g.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString(), max: 3 }) });
  return g.prisma;
}
