// scripts/fix-referral-codes.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// Connect to MongoDB
async function connectDb() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/clintonstack"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Generate a unique referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function fixReferralCodes() {
  try {
    await connectDb();

    // Drop the index first
    const collection = mongoose.connection.db.collection("users");
    try {
      await collection.dropIndex("referralCode_1");
      console.log("Dropped existing referralCode index");
    } catch (error) {
      console.log("No existing index to drop");
    }

    // Define User schema (simplified)
    const UserSchema = new mongoose.Schema({
      name: String,
      username: String,
      email: String,
      role: String,
      referralCode: {
        type: String,
        default: null,
      },
    });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Find affiliates with null referral codes
    const usersWithNullCodes = await User.find({
      referralCode: null,
      role: "affiliate",
    });
    console.log(
      `Found ${usersWithNullCodes.length} affiliates with null referral codes`
    );

    // Generate unique codes for each
    for (const user of usersWithNullCodes) {
      let uniqueCode;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        uniqueCode = generateReferralCode();
        const existing = await User.findOne({ referralCode: uniqueCode });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        console.error(`Failed to generate unique code for user ${user._id}`);
        continue;
      }

      user.referralCode = uniqueCode;
      await user.save();
      console.log(
        `Updated user ${user.email} with referral code: ${uniqueCode}`
      );
    }

    // Unset referralCode for all users with null (to remove from DB)
    const usersWithNull = await User.find({ referralCode: null });
    console.log(
      `Found ${usersWithNull.length} users with null referral codes, unsetting...`
    );
    for (const user of usersWithNull) {
      user.referralCode = undefined; // Unset the field
      await user.save();
      console.log(`Unset referral code for ${user.email}`);
    }

    // Reset referral codes for clients who have codes (shouldn't happen)
    const clientsWithCodes = await User.find({
      role: { $ne: "affiliate" },
      referralCode: { $exists: true },
    });
    console.log(
      `Found ${clientsWithCodes.length} clients with referral codes, resetting...`
    );
    for (const user of clientsWithCodes) {
      user.referralCode = undefined;
      await user.save();
      console.log(`Reset referral code for client ${user.email}`);
    }

    console.log("All referral codes have been fixed");

    // Try to recreate the sparse unique index
    try {
      await collection.createIndex(
        { referralCode: 1 },
        { unique: true, sparse: true }
      );
      console.log("Created sparse unique index on referralCode");
    } catch (error) {
      console.log(
        "Failed to create index, but data is fixed. You may need to create the index manually."
      );
      console.error("Index creation error:", error.message);
    }
  } catch (error) {
    console.error("Error fixing referral codes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
fixReferralCodes();
