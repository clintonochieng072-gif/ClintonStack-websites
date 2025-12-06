import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../src/lib/models/Plan";

// Load environment variables
dotenv.config({ path: ".env.local" });

const plansData = [
  {
    name: "Basic Plan",
    slug: "basic",
    price: 999,
    currency: "KES",
    features: [
      "Access to all templates",
      "Unlimited websites",
      "Full customization",
      "Custom domain support",
      "SEO optimization",
      "Analytics integration",
      "Lead management",
      "Email notifications",
      "Priority support",
      "Monthly subscription",
    ],
    sortOrder: 1,
    type: "subscription",
  },
  {
    name: "Lifetime Access",
    slug: "lifetime",
    price: 3999,
    currency: "KES",
    features: [
      "All features unlocked",
      "Unlimited websites",
      "Full customization",
      "Lifetime access - no recurring payments",
      "Priority onboarding",
      "Dedicated support",
    ],
    sortOrder: 2,
    type: "one_time",
  },
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🌱 Seeding plans...");

    // Clear existing plans
    await Plan.deleteMany({});
    console.log("🗑️  Cleared existing plans");

    // Insert new plans
    const plans = await Plan.insertMany(plansData);
    console.log(`✅ Inserted ${plans.length} plans`);

    // Log the plans
    plans.forEach((plan) => {
      console.log(
        `📋 ${plan.name}: ${plan.price} KES${
          plan.type === "one_time" ? " (one-time)" : "/month"
        }`
      );
    });

    console.log("🎉 Plans seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedPlans();
