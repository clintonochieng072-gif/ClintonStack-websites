import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/lib/models/Product";

// Load environment variables
dotenv.config({ path: ".env.local" });

const products = [
  // ADD YOUR NEW SAAS PRODUCTS HERE
  {
    name: "ClintonStack Basic",
    description:
      "Professional website builder for individuals and small businesses",
    slug: "clintonstack-basic",
    commissionRate: 500, // Affiliate commission in KES per referral
    features: [
      "Drag & drop website builder",
      "Mobile responsive templates",
      "Basic SEO tools",
      "Contact forms",
      "Social media integration",
    ],
    pricing: [
      {
        type: "monthly",
        amount: 2500,
        currency: "KES",
      },
      {
        type: "lifetime",
        amount: 15000,
        currency: "KES",
      },
    ],
    isActive: true, // Set to false to hide from affiliates
  },
  {
    name: "ClintonStack Pro",
    description:
      "Advanced website builder with premium features for growing businesses",
    slug: "clintonstack-pro",
    commissionRate: 750,
    features: [
      "All Basic features",
      "Advanced analytics",
      "E-commerce integration",
      "Custom domain",
      "Priority support",
      "Advanced SEO tools",
    ],
    pricing: [
      {
        type: "monthly",
        amount: 5000,
        currency: "KES",
      },
      {
        type: "lifetime",
        amount: 30000,
        currency: "KES",
      },
    ],
    isActive: true,
  },
  {
    name: "ClintonStack Enterprise",
    description:
      "Complete business solution with advanced features and white-label options",
    slug: "clintonstack-enterprise",
    commissionRate: 1000,
    features: [
      "All Pro features",
      "White-label options",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced security features",
    ],
    pricing: [
      {
        type: "monthly",
        amount: 10000,
        currency: "KES",
      },
      {
        type: "lifetime",
        amount: 75000,
        currency: "KES",
      },
    ],
    isActive: true,
  },
  {
    name: "ClintonStack Real Estate",
    description:
      "Professional real estate website builder with property listings, search, and lead management",
    slug: "clintonstack-real-estate",
    commissionRate: 650,
    features: [
      "Property listings management",
      "Advanced search & filters",
      "Property inquiry forms",
      "Lead management system",
      "Mortgage calculator",
      "Virtual tours integration",
      "Agent profiles",
      "Property valuation tools",
      "Market analytics",
      "Mobile-responsive design",
    ],
    pricing: [
      {
        type: "monthly",
        amount: 3500,
        currency: "KES",
      },
      {
        type: "lifetime",
        amount: 25000,
        currency: "KES",
      },
    ],
    isActive: true,
  },
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Seeded ${insertedProducts.length} products`);

    // Display inserted products
    insertedProducts.forEach((product) => {
      console.log(
        `- ${product.name} (${product.slug}): KES ${product.commissionRate} commission`
      );
    });

    console.log("Product seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeder
seedProducts();
