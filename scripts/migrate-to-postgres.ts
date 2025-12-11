import mongoose from "mongoose";
import { prisma } from "../src/db/postgres";
import User from "../src/lib/models/User";
import { usersRepo } from "../src/repositories/usersRepo";
import { affiliatesRepo } from "../src/repositories/affiliatesRepo";
import { referralsRepo } from "../src/repositories/referralsRepo";
import { paymentsRepo } from "../src/repositories/paymentsRepo";

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Connect to PostgreSQL
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    // Migrate users
    console.log("Migrating users...");
    const mongoUsers = await User.find({});
    let userCount = 0;

    for (const mongoUser of mongoUsers) {
      try {
        // Check if user already exists in PostgreSQL
        const existingUser = await usersRepo.findByEmail(mongoUser.email);
        if (existingUser) {
          console.log(`User ${mongoUser.email} already exists, skipping`);
          continue;
        }

        // Handle referral code uniqueness
        let referralCode = null;
        if (mongoUser.role === "affiliate") {
          if (mongoUser.referralCode) {
            // Check if the referral code is already taken in PostgreSQL
            const existingUserWithCode = await usersRepo.findByReferralCode(
              mongoUser.referralCode
            );
            if (existingUserWithCode) {
              // Generate a new unique code
              console.log(
                `Referral code ${mongoUser.referralCode} already exists, generating new one for ${mongoUser.email}`
              );
              referralCode = await usersRepo.generateUniqueReferralCode();
            } else {
              referralCode = mongoUser.referralCode;
            }
          }
          // If no referral code in MongoDB, generateUniqueReferralCode will be called in usersRepo.create
        }

        // Create user in PostgreSQL
        const pgUser = await usersRepo.create({
          name: mongoUser.name || mongoUser.username || "Unknown",
          username: mongoUser.username,
          email: mongoUser.email,
          passwordHash: mongoUser.passwordHash,
          role: mongoUser.role as any,
          referralCode: referralCode,
          clientId: mongoUser.clientId || mongoUser._id.toString(),
          referredById: mongoUser.referredBy
            ? mongoUser.referredBy.toString()
            : null,
          emailVerified: mongoUser.emailVerified || false,
          onboarded: mongoUser.onboarded || false,
        });

        // If user is affiliate, create affiliate profile
        if (mongoUser.role === "affiliate") {
          await affiliatesRepo.create({
            userId: pgUser.id,
            commissionRate: mongoUser.availableBalance ? 0.1 : 0.1, // Default or from balance
            payoutMethod: undefined, // Will be updated later
            status: "active",
          });
        }

        userCount++;
        if (userCount % 10 === 0) {
          console.log(`Migrated ${userCount} users`);
        }
      } catch (error) {
        console.error(`Error migrating user ${mongoUser.email}:`, error);
      }
    }

    console.log(`Migrated ${userCount} users`);

    // Migrate referrals
    console.log("Migrating referrals...");
    const mongoUsersWithReferrals = await User.find({
      referredBy: { $exists: true },
    });
    let referralCount = 0;

    for (const mongoUser of mongoUsersWithReferrals) {
      try {
        if (!mongoUser.referredBy) continue;

        // Find the affiliate user in PostgreSQL
        const referredUser = await usersRepo.findByEmail(mongoUser.email);
        const affiliateMongo = await User.findById(mongoUser.referredBy);
        if (!referredUser || !affiliateMongo) continue;

        const affiliateUser = await usersRepo.findByEmail(affiliateMongo.email);
        if (!affiliateUser || !affiliateUser.affiliate) continue;

        // Check if referral already exists
        const existingReferral = await referralsRepo.findByAffiliateAndUser(
          affiliateUser.affiliate.id,
          referredUser.id
        );
        if (existingReferral) continue;

        // Create referral
        await referralsRepo.create({
          affiliateId: affiliateUser.affiliate.id,
          referredUserId: referredUser.id,
          clickTimestamp: mongoUser.createdAt,
          conversionTimestamp: mongoUser.has_paid ? new Date() : null,
          status: mongoUser.has_paid ? "converted" : "active",
        });

        referralCount++;
      } catch (error) {
        console.error(
          `Error migrating referral for ${mongoUser.email}:`,
          error
        );
      }
    }

    console.log(`Migrated ${referralCount} referrals`);

    // Migrate payments (if any exist in MongoDB - assuming they might be in a different collection)
    // Note: The current User model doesn't have payments, so this might need adjustment
    // For now, we'll skip payments migration as they might not exist in the current schema

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    // Disconnect
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log("Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateData };
