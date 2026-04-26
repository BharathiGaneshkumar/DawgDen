import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Missing DATABASE_URL environment variable");
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy — DATABASE_URL is only required when Prisma is actually used
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
