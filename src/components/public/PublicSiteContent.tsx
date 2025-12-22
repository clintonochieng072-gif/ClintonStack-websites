"use client";

import React from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";
import Hero from "./Hero";
import FloatingButtons from "./FloatingButtons";
import { defaultHomeContent } from "@/data/defaultHomeContent";

const FeaturedProperties = dynamic(() => import("./FeaturedProperties"), {
  ssr: false,
});

interface Block {
  type: string;
  data: any;
}

interface Site {
  title: string;
  integrations?: any;
  userWebsite?: {
    data?: {
      blocks?: Block[];
    };
  };
  publishedWebsite?: {
    data?: {
      blocks?: Block[];
    };
  };
}

interface PublicSiteContentProps {
  site: Site;
}

export default function PublicSiteContent({ site }: PublicSiteContentProps) {
  // For preview mode, read from userWebsite.data, for live mode read from publishedWebsite.data
  const isPreview = !site.publishedWebsite?.data; // If no publishedWebsite.data, it's preview mode
  const siteData = isPreview
    ? site.userWebsite?.data
    : site.publishedWebsite?.data;
  const customBlocks = siteData?.blocks || [];

  // Merge default blocks with custom blocks
  // Note: Hero is handled separately by the Hero component above
  const defaultBlocks = [
    { type: "about", data: defaultHomeContent.about },
    { type: "services", data: defaultHomeContent.services },
    { type: "pricing", data: defaultHomeContent.pricing },
    { type: "testimonials", data: defaultHomeContent.testimonials },
    { type: "gallery", data: defaultHomeContent.gallery },
    { type: "contact", data: defaultHomeContent.contact },
    { type: "properties", data: defaultHomeContent.properties },
  ];

  // Create a map of custom blocks by type
  const customBlocksMap = new Map(
    customBlocks.map((block) => [block.type, block])
  );

  // Merge: use custom if exists, otherwise use default
  const blocks = defaultBlocks.map((defaultBlock) => {
    const customBlock = customBlocksMap.get(defaultBlock.type);
    if (customBlock) {
      // Check if custom block has actual content
      const hasContent =
        customBlock.data && Object.keys(customBlock.data).length > 0;
      return hasContent ? customBlock : defaultBlock;
    }
    return defaultBlock;
  });

  // Debug logging
  console.log("PublicSiteContent - Site loaded");

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Website Header */}
      <Header site={site} />

      {/* Hero Section */}
      <Hero site={site} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Main Content */}
      <main className="flex-1">
        <>
          {/* Featured Properties Section */}
          <FeaturedProperties site={site} />

          {/* Neighborhoods Section */}
          <Neighborhoods />

          {/* Regular Blocks */}
          {blocks.map((block, index) => (
            <BlockRenderer key={index} block={block} />
          ))}
        </>
      </main>

      {/* Website Footer */}
      <Footer site={site} />

      {/* Floating Contact Buttons */}
      <FloatingButtons
        phoneNumber={site.integrations?.phoneNumber}
        whatsappNumber={site.integrations?.whatsappNumber}
      />
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "services":
      return <ServicesBlock data={block.data} />;
    case "gallery":
      return <GalleryBlock data={block.data} />;
    case "testimonials":
      return <TestimonialsBlock data={block.data} />;
    case "contact":
      return <ContactBlock data={block.data} />;
    case "about":
      return <AboutBlock data={block.data} />;
    case "properties":
      // Skip properties block - only show featured properties
      return null;
    case "pricing":
      return <PricingBlock data={block.data} />;
    default:
      return null;
  }
}

function TrustBadges() {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 text-center overflow-x-auto">
        <p className="text-gray-600 mb-8 text-lg">
          Trusted real estate platform used by more than 1,500 clients across
          Kenya
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏠</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">150+</div>
              <div className="text-sm text-gray-600">Properties</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">4.8/5</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">2020</div>
              <div className="text-sm text-gray-600">Trusted Since</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">Verified</div>
              <div className="text-sm text-gray-600">Listings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Neighborhoods() {
  const neighborhoods = [
    {
      name: "Nairobi",
      image:
        "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80",
      properties: 45,
    },
    {
      name: "Kisumu",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      properties: 23,
    },
    {
      name: "Mombasa",
      image:
        "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      properties: 31,
    },
    {
      name: "Eldoret",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80",
      properties: 18,
    },
    {
      name: "Nakuru",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      properties: 27,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-full mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Neighborhoods
          </h2>
          <p className="text-xl text-gray-600">
            Find your perfect location across Kenya
          </p>
        </div>
        <div className="grid md:grid-cols-5 gap-6 overflow-x-auto">
          {neighborhoods.map((neighborhood, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => {
                // Scroll to properties section
                const propertiesElement = document.getElementById("properties");
                if (propertiesElement) {
                  propertiesElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <img
                  src={neighborhood.image}
                  alt={neighborhood.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">
                    {neighborhood.name}
                  </h3>
                  <p className="text-sm opacity-90">
                    {neighborhood.properties} Properties
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesBlock({ data }: { data: any }) {
  const services = data.services || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto">
          {services.map((service: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {service.price && (
                <p className="text-blue-600 font-semibold">{service.price}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ data }: { data: any }) {
  const images = data.images || data.photos || [];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
        <div className="grid md:grid-cols-3 gap-4 overflow-x-auto">
          {images.map((image: string, index: number) => (
            <img
              key={index}
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsBlock({ data }: { data: any }) {
  const testimonials = data.testimonials || [];

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Testimonials</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
              <p className="font-semibold">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ data }: { data: any }) {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
        <div className="space-y-4">
          {data.email && (
            <p className="text-lg">
              <strong>Email:</strong> {data.email}
            </p>
          )}
          {data.phone && (
            <p className="text-lg">
              <strong>Phone:</strong> {data.phone}
            </p>
          )}
          {data.address && (
            <p className="text-lg">
              <strong>Address:</strong> {data.address}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ data }: { data: any }) {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">About Us</h2>
        {data.profilePhoto && (
          <div className="mb-8">
            <img
              src={data.profilePhoto}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
            />
          </div>
        )}
        <p className="text-lg text-gray-600">
          {data.content || data.description}
        </p>
      </div>
    </section>
  );
}

function PropertiesBlock({ data }: { data: any }) {
  const properties = data.properties || data.list || [];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Properties</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: any, index: number) => (
            <div
              key={property._id || property.id || index}
              className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {property.images && property.images.length > 0 && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-3">{property.location}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-blue-600">
                    ${property.price}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {property.status
                      ? String(property.status).split("-").join(" ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.sqft} sqft</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingBlock({ data }: { data: any }) {
  const plans = data.plans || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-full mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-8 overflow-x-auto">
          {plans.map((plan: any, index: number) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-md text-center"
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">
                {plan.price}
              </div>
              <ul className="text-gray-600 space-y-2">
                {plan.features?.map((feature: string, idx: number) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
