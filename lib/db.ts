import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
    var prisma: PrismaClient | undefined;
}

// Prisma 7 no longer connects on its own — it needs a driver adapter, and the
// connection string comes from here rather than from schema.prisma.
// PrismaPg speaks plain Postgres, so this works against Supabase or Neon alike.
const createClient = () =>
    new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });

export const db = globalThis.prisma || createClient();

if(process.env.NODE_ENV !== "production") globalThis.prisma = db;
