import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { generateClientId } from "../src/lib/utils";

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

async function createAdminUser() {
  try {
    console.log("Connecting to PostgreSQL...");
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    const adminEmail = "clintonochieng072@gmail.com";
    const adminPassword = "admin123"; // Change this to a secure password

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`Admin user ${adminEmail} already exists, updating password...`);
      // Update password
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          passwordHash: hashedPassword,
          role: "admin",
          emailVerified: true,
          onboarded: true,
          has_paid: true,
        },
      });
      console.log(`Updated admin user password`);
      console.log(`Login credentials: ${adminEmail} / ${adminPassword}`);
      return;
    }
    const clientId = generateClientId();

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        username: "admin",
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "admin",
        clientId,
        emailVerified: true,
        onboarded: true,
        has_paid: true,
      },
    });

    console.log(`Created admin user: ${admin.name} (${admin.email})`);
    console.log(`Login credentials: ${adminEmail} / ${adminPassword}`);

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from PostgreSQL");
  }
}

// Run the script
createAdminUser();