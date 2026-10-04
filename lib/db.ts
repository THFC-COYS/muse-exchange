/**
 * Prisma client singleton + database availability check.
 *
 * The Exchange runs in two modes:
 * - DATABASE_URL set and reachable: all reads and writes go to Postgres.
 * - DATABASE_URL unset (or the database unreachable): the app falls back to
 *   the seed data in lib/seed.ts, and write features show a setup notice.
 *
 * Importing this module never touches the network. The client connects
 * lazily on the first query, so `next build` is safe with no database.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __mxPrisma: PrismaClient | undefined;
}

/** True when a Postgres connection string is configured. */
export function dbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export const prisma: PrismaClient =
  global.__mxPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__mxPrisma = prisma;
}
