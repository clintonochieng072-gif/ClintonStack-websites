import mongoose from "mongoose";
import dotenv from "dotenv";
import BillingStats from "../src/lib/models/BillingStats";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function seedBillingStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🌱 Seeding billing stats...");

    // Check if billing stats already exist
    const existingStats = await BillingStats.findOne();
    if (existingStats) {
      console.log("✅ Billing stats already exist");
      console.log(`Lifetime count: ${existingStats.lifetimeCount}/${existingStats.lifetimeLimit}`);
      return;
    }

    // Create initial billing stats
    const billingStats = await BillingStats.create({
      lifetimeCount: 0,
      lifetimeLimit: 10,
    });

    console.log("✅ Created billing stats");
    console.log(`Lifetime count: ${billingStats.lifetimeCount}/${billingStats.lifetimeLimit}`);

    console.log("🎉 Billing stats seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding billing stats:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedBillingStats();