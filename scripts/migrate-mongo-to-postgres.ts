import mongoose from "mongoose";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// MongoDB Models (to be migrated)
const MongoUserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  passwordHash: String,
  role: {
    type: String,
    enum: ["client", "affiliate", "admin"],
    default: "client",
  },
  category: String,
  niche: String,
  template: String,
  onboarded: { type: Boolean, default: false },
  avatarUrl: String,
  plan: { type: String, default: "free" },
  status: { type: String, default: "active" },
  customDomain: String,
  has_paid: { type: Boolean, default: false },
  is_first_login: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  lastLogin: Date,
  trialEndsAt: Date,
  emailVerified: { type: Boolean, default: true },
  subscriptionStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  subscriptionType: {
    type: String,
    enum: ["monthly", "lifetime", null],
    default: null,
  },
  subscriptionExpiresAt: Date,
  clientId: { type: String, required: true, unique: true },
  referralCode: { type: String, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  availableBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  tempPassword: String,
  createdAt: { type: Date, default: Date.now },
});

const MongoReferralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const MongoAffiliateEarningsSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  referralCount: { type: Number, default: 0 },
  paidReferralCount: { type: Number, default: 0 },
  paidEarnings: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const MongoPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  paymentMethod: { type: String, default: "mpesa" },
  transactionId: String,
  planType: { type: String, enum: ["monthly", "lifetime"], default: "monthly" },
  createdAt: { type: Date, default: Date.now },
});

const MongoManualPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  paymentMethod: String,
  transactionId: String,
  notes: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

// Register models
const MongoUser =
  mongoose.models.User || mongoose.model("User", MongoUserSchema);
const MongoReferral =
  mongoose.models.Referral || mongoose.model("Referral", MongoReferralSchema);
const MongoAffiliateEarnings =
  mongoose.models.AffiliateEarnings ||
  mongoose.model("AffiliateEarnings", MongoAffiliateEarningsSchema);
const MongoPayment =
  mongoose.models.Payment || mongoose.model("Payment", MongoPaymentSchema);
const MongoManualPayment =
  mongoose.models.ManualPayment ||
  mongoose.model("ManualPayment", MongoManualPaymentSchema);

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateUsers() {
  console.log("🔄 Migrating users from MongoDB to PostgreSQL...");

  const mongoUsers = await MongoUser.find({}).lean();
  console.log(`Found ${mongoUsers.length} users in MongoDB`);

  let migrated = 0;
  let skipped = 0;

  for (const mongoUser of mongoUsers) {
    try {
      // Check if user already exists in PostgreSQL
      const existingUser = await prisma.user.findUnique({
        where: { email: mongoUser.email.toLowerCase() },
      });

      if (existingUser) {
        console.log(
          `⏭️  User ${mongoUser.email} already exists in PostgreSQL, skipping...`
        );
        skipped++;
        continue;
      }

      // Generate unique username if needed
      let username = mongoUser.username;
      if (!username) {
        const baseUsername = mongoUser.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        username = baseUsername;
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
      }

      // Create user in PostgreSQL
      const pgUser = await prisma.user.create({
        data: {
          name: mongoUser.name,
          username,
          email: mongoUser.email.toLowerCase(),
          passwordHash: mongoUser.passwordHash,
          role: mongoUser.role as any,
          referralCode: mongoUser.referralCode,
          clientId: mongoUser.clientId,
          emailVerified: mongoUser.emailVerified,
          onboarded: mongoUser.onboarded,
        },
      });

      // Create affiliate profile if role is affiliate
      if (mongoUser.role === "affiliate") {
        await prisma.affiliate.create({
          data: {
            userId: pgUser.id,
            commissionRate: 0.1, // Default 10%
            status: "active",
          },
        });
      }

      migrated++;
      console.log(`✅ Migrated user: ${mongoUser.email} (${pgUser.id})`);
    } catch (error) {
      console.error(`❌ Failed to migrate user ${mongoUser.email}:`, error);
    }
  }

  console.log(
    `📊 Users migration complete: ${migrated} migrated, ${skipped} skipped`
  );
}

async function migrateReferrals() {
  console.log("🔄 Migrating referrals from MongoDB to PostgreSQL...");

  const mongoReferrals = await MongoReferral.find({})
    .populate("referrerId referredUserId")
    .lean();
  console.log(`Found ${mongoReferrals.length} referrals in MongoDB`);

  let migrated = 0;
  let skipped = 0;

  for (const mongoReferral of mongoReferrals) {
    try {
      // Find referrer in PostgreSQL
      const referrer = await prisma.user.findFirst({
        where: {
          email: (mongoReferral.referrerId as any).email?.toLowerCase(),
        },
      });

      // Find referred user in PostgreSQL
      const referredUser = await prisma.user.findFirst({
        where: {
          email: (mongoReferral.referredUserId as any).email?.toLowerCase(),
        },
      });

      if (!referrer || !referredUser) {
        console.log(`⏭️  Could not find users for referral, skipping...`);
        skipped++;
        continue;
      }

      // Check if referral already exists
      const existingReferral = await prisma.referral.findUnique({
        where: {
          affiliateId_referredUserId: {
            affiliateId: referrer.id,
            referredUserId: referredUser.id,
          },
        },
      });

      if (existingReferral) {
        console.log(`⏭️  Referral already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create referral in PostgreSQL
      await prisma.referral.create({
        data: {
          affiliateId: referrer.id,
          referredUserId: referredUser.id,
          status:
            mongoReferral.paymentStatus === "paid" ? "converted" : "active",
        },
      });

      migrated++;
      console.log(
        `✅ Migrated referral: ${referrer.email} -> ${referredUser.email}`
      );
    } catch (error) {
      console.error(`❌ Failed to migrate referral:`, error);
    }
  }

  console.log(
    `📊 Referrals migration complete: ${migrated} migrated, ${skipped} skipped`
  );
}

async function migratePayments() {
  console.log("🔄 Migrating payments from MongoDB to PostgreSQL...");

  const mongoPayments = await MongoPayment.find({}).populate("userId").lean();
  console.log(`Found ${mongoPayments.length} payments in MongoDB`);

  let migrated = 0;
  let skipped = 0;

  for (const mongoPayment of mongoPayments) {
    try {
      // Find user in PostgreSQL
      const user = await prisma.user.findFirst({
        where: { email: (mongoPayment.userId as any).email?.toLowerCase() },
      });

      if (!user) {
        console.log(`⏭️  Could not find user for payment, skipping...`);
        skipped++;
        continue;
      }

      // Create payment in PostgreSQL
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: mongoPayment.amount,
          status: mongoPayment.status as any,
          paymentMethod: mongoPayment.paymentMethod,
          transactionId: mongoPayment.transactionId,
          planType: mongoPayment.planType,
        },
      });

      migrated++;
      console.log(
        `✅ Migrated payment: ${user.email} - $${mongoPayment.amount}`
      );
    } catch (error) {
      console.error(`❌ Failed to migrate payment:`, error);
    }
  }

  console.log(
    `📊 Payments migration complete: ${migrated} migrated, ${skipped} skipped`
  );
}

async function migrateManualPayments() {
  console.log("🔄 Migrating manual payments from MongoDB to PostgreSQL...");

  const mongoManualPayments = await MongoManualPayment.find({})
    .populate("userId")
    .lean();
  console.log(`Found ${mongoManualPayments.length} manual payments in MongoDB`);

  let migrated = 0;
  let skipped = 0;

  for (const mongoPayment of mongoManualPayments) {
    try {
      // Find user in PostgreSQL
      const user = await prisma.user.findFirst({
        where: { email: (mongoPayment.userId as any).email?.toLowerCase() },
      });

      if (!user) {
        console.log(`⏭️  Could not find user for manual payment, skipping...`);
        skipped++;
        continue;
      }

      // Create payment in PostgreSQL
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: mongoPayment.amount,
          status:
            mongoPayment.status === "approved"
              ? "success"
              : mongoPayment.status === "rejected"
              ? "failed"
              : "pending",
          paymentMethod: mongoPayment.paymentMethod || "manual",
          transactionId: mongoPayment.transactionId,
          planType: "monthly", // Default
        },
      });

      migrated++;
      console.log(
        `✅ Migrated manual payment: ${user.email} - $${mongoPayment.amount}`
      );
    } catch (error) {
      console.error(`❌ Failed to migrate manual payment:`, error);
    }
  }

  console.log(
    `📊 Manual payments migration complete: ${migrated} migrated, ${skipped} skipped`
  );
}

async function createCommissionsFromEarnings() {
  console.log("🔄 Creating commissions from affiliate earnings...");

  const earnings = await MongoAffiliateEarnings.find({})
    .populate("affiliateId")
    .lean();
  console.log(`Found ${earnings.length} earnings records`);

  let created = 0;

  for (const earning of earnings) {
    try {
      // Find affiliate in PostgreSQL
      const affiliate = await prisma.user.findFirst({
        where: { email: (earning.affiliateId as any).email?.toLowerCase() },
      });

      if (!affiliate) continue;

      // Find affiliate profile
      const affiliateProfile = await prisma.affiliate.findUnique({
        where: { userId: affiliate.id },
      });

      if (!affiliateProfile) continue;

      // Create commission records based on paid earnings
      if (earning.paidEarnings > 0) {
        // This is a simplified approach - in reality you'd need to link to actual payments
        await prisma.commission.create({
          data: {
            affiliateId: affiliateProfile.id,
            paymentId: "migration-commission", // Placeholder - would need real payment IDs
            commissionAmount: earning.paidEarnings,
            status: "paid",
          },
        });

        created++;
        console.log(
          `✅ Created commission for ${affiliate.email}: $${earning.paidEarnings}`
        );
      }
    } catch (error) {
      console.error(`❌ Failed to create commission:`, error);
    }
  }

  console.log(`📊 Commissions creation complete: ${created} created`);
}

async function validateAndUpdateOrphanReferences() {
  console.log("🔍 Validating and updating orphan references in MongoDB...");

  // Create a mapping of old MongoDB user IDs to new PostgreSQL user IDs
  const mongoUsers = await MongoUser.find({}).lean();
  const userIdMapping: { [key: string]: string } = {};

  for (const mongoUser of mongoUsers) {
    const pgUser = await prisma.user.findFirst({
      where: { email: mongoUser.email.toLowerCase() },
    });
    if (pgUser) {
      userIdMapping[(mongoUser as any)._id.toString()] = pgUser.id;
    }
  }

  console.log(
    `📊 Created ID mapping for ${Object.keys(userIdMapping).length} users`
  );

  // Update Site documents
  const sites = await mongoose.connection.db
    .collection("sites")
    .find({})
    .toArray();
  let sitesUpdated = 0;
  for (const site of sites) {
    if (site.ownerId && userIdMapping[site.ownerId.toString()]) {
      await mongoose.connection.db
        .collection("sites")
        .updateOne(
          { _id: site._id },
          { $set: { ownerId: userIdMapping[site.ownerId.toString()] } }
        );
      sitesUpdated++;
    }
  }
  console.log(`✅ Updated ${sitesUpdated} site ownerId references`);

  // Update Contact documents (leads)
  const contacts = await mongoose.connection.db
    .collection("contacts")
    .find({})
    .toArray();
  let contactsUpdated = 0;
  for (const contact of contacts) {
    if (contact.assignedTo && userIdMapping[contact.assignedTo.toString()]) {
      await mongoose.connection.db
        .collection("contacts")
        .updateOne(
          { _id: contact._id },
          { $set: { assignedTo: userIdMapping[contact.assignedTo.toString()] } }
        );
      contactsUpdated++;
    }
  }
  console.log(`✅ Updated ${contactsUpdated} contact assignedTo references`);

  // Update Property documents
  const properties = await mongoose.connection.db
    .collection("properties")
    .find({})
    .toArray();
  let propertiesUpdated = 0;
  for (const property of properties) {
    if (property.userId && userIdMapping[property.userId.toString()]) {
      await mongoose.connection.db
        .collection("properties")
        .updateOne(
          { _id: property._id },
          { $set: { userId: userIdMapping[property.userId.toString()] } }
        );
      propertiesUpdated++;
    }
  }
  console.log(`✅ Updated ${propertiesUpdated} property userId references`);

  // Update Notification documents
  const notifications = await mongoose.connection.db
    .collection("notifications")
    .find({})
    .toArray();
  let notificationsUpdated = 0;
  for (const notification of notifications) {
    if (notification.userId && userIdMapping[notification.userId.toString()]) {
      await mongoose.connection.db
        .collection("notifications")
        .updateOne(
          { _id: notification._id },
          { $set: { userId: userIdMapping[notification.userId.toString()] } }
        );
      notificationsUpdated++;
    }
  }
  console.log(
    `✅ Updated ${notificationsUpdated} notification userId references`
  );

  // Check for any remaining orphan references
  const orphanSites = await mongoose.connection.db
    .collection("sites")
    .countDocuments({
      ownerId: { $nin: Object.values(userIdMapping) },
    });
  const orphanContacts = await mongoose.connection.db
    .collection("contacts")
    .countDocuments({
      assignedTo: { $nin: Object.values(userIdMapping) },
    });
  const orphanProperties = await mongoose.connection.db
    .collection("properties")
    .countDocuments({
      userId: { $nin: Object.values(userIdMapping) },
    });
  const orphanNotifications = await mongoose.connection.db
    .collection("notifications")
    .countDocuments({
      userId: { $nin: Object.values(userIdMapping) },
    });

  console.log("🚨 Orphan reference check:");
  console.log(`   Sites: ${orphanSites} orphans`);
  console.log(`   Contacts: ${orphanContacts} orphans`);
  console.log(`   Properties: ${orphanProperties} orphans`);
  console.log(`   Notifications: ${orphanNotifications} orphans`);

  if (
    orphanSites + orphanContacts + orphanProperties + orphanNotifications >
    0
  ) {
    console.warn(
      "⚠️  Warning: Some orphan references remain. These may need manual cleanup."
    );
  } else {
    console.log("✅ No orphan references found!");
  }
}

async function main() {
  try {
    console.log("🚀 Starting MongoDB to PostgreSQL migration...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Connect to PostgreSQL
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL");

    // Run migrations in order
    await migrateUsers();
    await migrateReferrals();
    await migratePayments();
    await migrateManualPayments();
    await createCommissionsFromEarnings();
    await validateAndUpdateOrphanReferences();

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

// Run migration
main();
