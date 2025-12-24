import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { generateClientId } from "../src/lib/utils";
import mongoose from "mongoose";
import { Site } from "../src/lib/models/Site";
import Property from "../src/lib/models/Property";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const mongoUri = process.env.MONGODB_URI;

async function createDemoAccount() {
  try {
    console.log("Connecting to databases...");

    // Connect to PostgreSQL
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    // Connect to MongoDB
    await mongoose.connect(mongoUri!);
    console.log("Connected to MongoDB");

    const demoEmail = "clintonstack4@gmail.com";
    const demoPassword = "demo123";
    const demoName = "Clinton Stack Demo";
    const demoUsername = "clintonstackdemo";
    const siteSlug = "clintonstack-demo";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (existingUser) {
      console.log(`Demo user ${demoEmail} already exists, updating...`);
      await prisma.user.update({
        where: { email: demoEmail },
        data: {
          name: demoName,
          username: demoUsername,
          role: "client",
          emailVerified: true,
          onboarded: true,
          has_paid: true,
          subscriptionStatus: "lifetime",
        },
      });
      console.log(`Updated demo user`);
    } else {
      // Create demo user
      const hashedPassword = await bcrypt.hash(demoPassword, 12);
      const clientId = generateClientId();

      const user = await prisma.user.create({
        data: {
          name: demoName,
          username: demoUsername,
          email: demoEmail,
          passwordHash: hashedPassword,
          role: "client",
          clientId,
          emailVerified: true,
          onboarded: true,
          has_paid: true,
          subscriptionStatus: "lifetime",
        },
      });

      console.log(`Created demo user: ${user.name} (${user.email})`);
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!user) {
      throw new Error("Failed to find created user");
    }

    // Check if site exists
    let site = await Site.findOne({ ownerId: user.id });

    if (site) {
      console.log("Demo site already exists, updating...");
    } else {
      // Create demo site
      site = new Site({
        ownerId: user.id,
        slug: siteSlug,
        niche: "real-estate",
        title: "Clinton Stack Real Estate Demo",
        description:
          "Premium real estate services showcasing our platform capabilities",
        published: true,
      });
    }

    // Complete site data
    const completeSiteData = {
      hero: {
        title: "Find Your Perfect Home",
        subtitle:
          "Discover exceptional properties that match your lifestyle. We connect you with verified homes that feel like home, wherever you are.",
        primaryCtaText: "View Properties",
        primaryCtaLink: "#properties",
        secondaryCtaText: "Contact Us",
        secondaryCtaLink: "#contact",
        carouselImages: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
          "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
        ],
      },
      about: {
        content:
          "With extensive experience in the real estate market, we've helped thousands of families and investors find their perfect property. Our expertise, combined with professional standards, ensures you get the best value and peace of mind in every transaction. We're not just agents – we're your trusted partners in building your future.",
        profilePhoto: "",
      },
      testimonials: {
        testimonials: [
          {
            id: "demo-testimonial-1",
            name: "Sarah Johnson",
            title: "Home Buyer",
            comment:
              "Working with this agent was a seamless experience. Highly recommended!",
            rating: 5,
          },
          {
            id: "demo-testimonial-2",
            name: "Michael Chen",
            title: "Property Investor",
            comment:
              "Exceptional service and expertise. Found my dream investment property.",
            rating: 5,
          },
          {
            id: "demo-testimonial-3",
            name: "Emma Rodriguez",
            title: "First-time Buyer",
            comment:
              "Made the home buying process stress-free. Professional and knowledgeable.",
            rating: 5,
          },
        ],
      },
      contact: {
        email: "info@clintonstackdemo.com",
        phone: "+254 700 123 456",
        whatsapp: "+254700123456",
        address: "123 Real Estate Avenue, Nairobi, Kenya",
        officeHours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
      },
      properties: {
        properties: [
          {
            id: "demo-prop-1",
            title: "Modern 4BR Villa in Karen",
            description:
              "Stunning contemporary villa with panoramic city views. Features include a spacious open-plan living area, gourmet kitchen, master suite with walk-in closet, and a beautiful garden.",
            price: 45000000,
            location: "Karen, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
              "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            ],
            beds: 4,
            baths: 3,
            size: 3200,
            propertyType: "villa",
            status: "for-sale",
          },
          {
            id: "demo-prop-2",
            title: "Luxury 3BR Apartment in Westlands",
            description:
              "Premium apartment in the heart of Westlands. Modern finishes, high-end appliances, and access to exclusive amenities including gym, pool, and concierge service.",
            price: 18500000,
            location: "Westlands, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 3,
            baths: 2,
            size: 1800,
            propertyType: "apartment",
            status: "for-sale",
          },
          {
            id: "demo-prop-3",
            title: "Elegant Townhouse in Kilimani",
            description:
              "Charming townhouse with private garden. Perfect for families seeking a quiet neighborhood with excellent schools and shopping nearby.",
            price: 28000000,
            location: "Kilimani, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 3,
            baths: 3,
            size: 2200,
            propertyType: "townhouse",
            status: "for-sale",
          },
          {
            id: "demo-prop-4",
            title: "Penthouse with City Views",
            description:
              "Breathtaking penthouse offering 360-degree city views. Features include floor-to-ceiling windows, private terrace, and premium finishes throughout.",
            price: 75000000,
            location: "Central Business District, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 4,
            baths: 4,
            size: 4500,
            propertyType: "penthouse",
            status: "for-sale",
          },
          {
            id: "demo-prop-5",
            title: "Cozy 2BR Cottage in Karen",
            description:
              "Charming cottage perfect for a small family or investors. Well-maintained with modern updates and a lovely garden setting.",
            price: 12000000,
            location: "Karen, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 2,
            baths: 2,
            size: 1200,
            propertyType: "cottage",
            status: "for-sale",
          },
          {
            id: "demo-prop-6",
            title: "Commercial Office Space CBD",
            description:
              "Prime commercial space in the Central Business District. Perfect for offices, medical practices, or professional services.",
            price: 35000000,
            location: "CBD, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 0,
            baths: 4,
            size: 3000,
            propertyType: "commercial",
            status: "for-sale",
          },
          {
            id: "demo-prop-7",
            title: "Luxury 5BR Mansion Estate",
            description:
              "Magnificent estate with expansive grounds, multiple garages, pool, and home theater. A true masterpiece of modern luxury living.",
            price: 150000000,
            location: "Runda, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 5,
            baths: 6,
            size: 8000,
            propertyType: "mansion",
            status: "for-sale",
          },
          {
            id: "demo-prop-8",
            title: "Modern 3BR Condo Riverside",
            description:
              "Stylish condominium with river views. Open floor plan, high ceilings, and access to building amenities including security and parking.",
            price: 22000000,
            location: "Riverside, Nairobi",
            images: [
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
            ],
            beds: 3,
            baths: 2,
            size: 1600,
            propertyType: "condo",
            status: "for-rent",
          },
        ],
      },
      services: {
        services: [
          {
            id: "demo-service-1",
            title: "Property Sales",
            description:
              "Expert guidance through the property buying process with access to exclusive listings.",
            icon: "🏠",
          },
          {
            id: "demo-service-2",
            title: "Property Rentals",
            description:
              "Comprehensive rental services for residential and commercial properties.",
            icon: "🔑",
          },
          {
            id: "demo-service-3",
            title: "Property Management",
            description:
              "Full-service property management for landlords and investors.",
            icon: "📊",
          },
          {
            id: "demo-service-4",
            title: "Investment Consulting",
            description:
              "Strategic real estate investment advice and portfolio management.",
            icon: "📈",
          },
        ],
      },
      footer: {
        socialLinks: {
          facebook: "https://facebook.com/YourAgency",
          instagram: "https://instagram.com/YourAgency",
          twitter: "https://twitter.com/YourAgency",
          linkedin: "",
        },
      },
    };

    // Set up the site data
    site.userWebsite = {
      draft: { blocks: [] },
      published: { blocks: [] },
      data: completeSiteData,
      integrations: {},
    };

    site.publishedWebsite = {
      data: completeSiteData,
      integrations: {},
    };

    // Add blocks to draft for editing
    site.userWebsite.draft.blocks = [
      { type: "hero", data: completeSiteData.hero },
      { type: "about", data: completeSiteData.about },
      { type: "testimonials", data: completeSiteData.testimonials },
      { type: "contact", data: completeSiteData.contact },
      { type: "properties", data: completeSiteData.properties },
      { type: "services", data: completeSiteData.services },
      { type: "footer", data: completeSiteData.footer },
    ];

    site.published = true;

    await site.save();
    console.log(`Demo site configured: ${site.slug}`);

    console.log("\n🎉 Demo account setup complete!");
    console.log(`Email: ${demoEmail}`);
    console.log(`Password: ${demoPassword}`);
    console.log(
      `Site URL: https://clintonstackdemo.vercel.app/site/${siteSlug}`
    );
    console.log("\nFeatures included:");
    console.log("- Complete profile information");
    console.log("- Phone number: +254 700 123 456");
    console.log("- 3 testimonials");
    console.log("- 8 properties with multiple images each");
    console.log("- All required fields filled");
    console.log("- Social media links");
    console.log("- Services section");
  } catch (error) {
    console.error("Error creating demo account:", error);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
    console.log("Disconnected from databases");
  }
}

// Run the script
createDemoAccount();
