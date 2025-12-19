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

async function createAffiliateRecords() {
  try {
    console.log("\n=== CREATING MISSING AFFILIATE RECORDS ===\n");

    // Find all users with role 'affiliate' who don't have an affiliate record
    const affiliateUsers = await prisma.user.findMany({
      where: {
        role: "affiliate",
        affiliate: null, // No affiliate record exists
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      },
    });

    console.log(
      `Found ${affiliateUsers.length} users with role 'affiliate' missing affiliate records`
    );

    for (const user of affiliateUsers) {
      console.log(
        `Creating affiliate record for: ${user.name} (${user.email})`
      );

      await prisma.affiliate.create({
        data: {
          userId: user.id,
          commissionRate: 0.15, // Default 15%
          status: "active",
          availableBalance: 0,
          totalEarned: 0,
          pendingBalance: 0,
        },
      });

      console.log(`✅ Created affiliate record for ${user.name}`);
    }

    console.log("\n=== VERIFICATION ===\n");

    // Verify the records were created
    const allAffiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`Total affiliate records now: ${allAffiliates.length}`);
    allAffiliates.forEach((aff) => {
      console.log(
        `- ${aff.user.name} (${aff.user.email}) - Status: ${aff.status}`
      );
    });
  } catch (error) {
    console.error("Error creating affiliate records:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAffiliateRecords();
