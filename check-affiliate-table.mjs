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

async function checkAffiliateTable() {
  try {
    console.log("\n=== AFFILIATE TABLE CHECK ===\n");

    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            onboarded: true,
          },
        },
      },
    });

    console.log(`Affiliate records in Affiliate table: ${affiliates.length}`);
    affiliates.forEach((aff) => {
      console.log(
        `- ${aff.user.name} (${aff.user.email}) - Status: ${aff.status} - Balance: ${aff.availableBalance}`
      );
    });

    console.log("\n=== USERS WITH AFFILIATE ROLE ===\n");

    const affiliateUsers = await prisma.user.findMany({
      where: { role: "affiliate" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboarded: true,
        affiliate: {
          select: {
            id: true,
            status: true,
            availableBalance: true,
          },
        },
      },
    });

    console.log(`Users with role 'affiliate': ${affiliateUsers.length}`);
    affiliateUsers.forEach((user) => {
      const hasAffiliateRecord = user.affiliate ? "✅" : "❌";
      console.log(
        `- ${user.name} (${user.email}) - Affiliate Record: ${hasAffiliateRecord} - Onboarded: ${user.onboarded}`
      );
    });
  } catch (error) {
    console.error("Error checking affiliate table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAffiliateTable();
