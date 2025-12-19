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

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        onboarded: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`\n=== USERS IN SYSTEM (${users.length} total) ===\n`);

    const clients = users.filter((u) => u.role !== "affiliate");
    const affiliates = users.filter((u) => u.role === "affiliate");

    console.log(`CLIENTS (${clients.length}):`);
    clients.forEach((user) => {
      console.log(
        `- ${user.name} (${user.email}) - Role: ${user.role} - Onboarded: ${
          user.onboarded
        } - Created: ${user.createdAt.toISOString().split("T")[0]}`
      );
    });

    console.log(`\nAFFILIATES (${affiliates.length}):`);
    affiliates.forEach((user) => {
      console.log(
        `- ${user.name} (${user.email}) - Role: ${user.role} - Onboarded: ${
          user.onboarded
        } - Created: ${user.createdAt.toISOString().split("T")[0]}`
      );
    });

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Users: ${users.length}`);
    console.log(`Clients: ${clients.length}`);
    console.log(`Affiliates: ${affiliates.length}`);
  } catch (error) {
    console.error("Error listing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
