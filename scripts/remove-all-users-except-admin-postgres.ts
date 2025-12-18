import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/client";
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

async function removeUsers() {
  try {
    console.log("Connecting to PostgreSQL...");
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    // Count total users
    const totalUsers = await prisma.user.count();
    console.log(`Total users in database: ${totalUsers}`);

    // Find the admin user
    const adminEmail = "clintonochieng072@gmail.com";
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      console.error(`Admin user ${adminEmail} not found!`);
      return;
    }
    console.log(`Keeping admin: ${admin.name} (${admin.email})`);

    // Count users to delete
    const usersToDelete = await prisma.user.count({
      where: {
        email: {
          not: adminEmail,
        },
      },
    });
    console.log(`Users to delete: ${usersToDelete}`);

    // Delete all users except admin
    // Due to cascade deletes, related records will be deleted automatically
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          not: adminEmail,
        },
      },
    });
    console.log(`Deleted ${result.count} users`);

    // Verify
    const remaining = await prisma.user.count();
    console.log(`Remaining users: ${remaining}`);
  } catch (error) {
    console.error("Error removing users:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from PostgreSQL");
  }
}

// Run the script
removeUsers();
