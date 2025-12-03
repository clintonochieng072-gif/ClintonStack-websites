import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../src/lib/models/Plan";

// Load environment variables
dotenv.config({ path: ".env.local" });

const plansData = [
  {
    name: "Starter",
    slug: "starter",
    price: 499,
    currency: "KES",
    baseStorage: 1,
    maxImages: 50,
    features: [
      "Access to Real Estate Template",
      "1 Website",
      "Limited customizable sections",
      "Drag-and-drop blocks",
      "Save draft & publish",
      "ClintonStack subdomain",
      "Basic SEO controls",
      "Sitemap + indexing",
      "Custom colors",
      "Upload logo",
      "10 max properties",
      "3 property categories",
      "5 gallery images per property",
      "1 featured property pin",
      "Lead capture forms",
      "20 monthly leads limit",
      "Automated email alerts",
      "Basic visit counter",
    ],
    extraStoragePrice: 500,
    sortOrder: 1,
  },
  {
    name: "Basic",
    slug: "basic",
    price: 999,
    currency: "KES",
    baseStorage: 3,
    maxImages: 150,
    features: [
      "Everything in Starter",
      "Template switching",
      "Custom fonts",
      "Custom domain connection",
      "Standard SEO controls",
      "Google Analytics / Meta Pixel",
      "30 max properties",
      "5 property categories",
      "10 gallery images per property",
      "3 featured property pins",
      "50 monthly leads limit",
      "Lead export",
      "WhatsApp lead integration",
      "Standard CRM dashboard",
      "Traffic breakdown analytics",
      "1 team member",
      "Activity logs",
      "48hr support response",
      "Video upload support",
    ],
    extraStoragePrice: 1000,
    sortOrder: 2,
  },
  {
    name: "Pro",
    slug: "pro",
    price: 1999,
    currency: "KES",
    baseStorage: 10,
    maxImages: 500,
    features: [
      "Everything in Basic",
      "Remove ClintonStack branding",
      "3 websites",
      "Full customizable sections",
      "Advanced theme options",
      "Custom CSS",
      "Advanced SEO controls",
      "100 max properties",
      "Unlimited property categories",
      "20 gallery images per property",
      "Unlimited featured properties",
      "Property import/export",
      "200 monthly leads limit",
      "Advanced CRM dashboard",
      "Lead funnel analytics",
      "Real-time dashboard",
      "Export analytics",
      "3 team members",
      "Role permissions",
      "24hr support response",
      "Onboarding call",
      "High-resolution image support",
      "Auto publish",
    ],
    extraStoragePrice: 2000,
    sortOrder: 3,
  },
  {
    name: "Elite",
    slug: "elite",
    price: 4999,
    currency: "KES",
    baseStorage: 20,
    maxImages: 1400,
    features: [
      "Everything in Pro",
      "Unlimited websites",
      "Full + custom blocks",
      "Enhanced drag-and-drop",
      "Unlimited properties",
      "Unlimited gallery images",
      "Priority indexing tools",
      "Unlimited monthly leads",
      "CRM + automations",
      "10 team members",
      "6hr priority support",
      "Concierge setup",
      "Unlimited storage",
      "Unlimited images",
      "Scheduled publish",
    ],
    extraStoragePrice: 5000,
    sortOrder: 4,
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
        `📋 ${plan.name}: ${plan.price} KES/month, ${plan.baseStorage}GB storage, ${plan.maxImages} images`
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
