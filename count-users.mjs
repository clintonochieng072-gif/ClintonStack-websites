import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "./src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function countUsers() {
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in PostgreSQL: ${userCount}`);
  } catch (error) {
    console.error("Error counting users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

countUsers();
