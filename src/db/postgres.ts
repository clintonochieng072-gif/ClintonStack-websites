import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Create a connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// @ts-ignore - PrismaClient constructor typing issues
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Database connection helper
export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw error;
  }
}

export async function disconnectPostgres() {
  await prisma.$disconnect();
}
