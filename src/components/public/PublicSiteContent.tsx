"use client";

import React from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";
import Hero from "./Hero";
import SearchSection from "./SearchSection";
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
  slug?: string;
  layout?: string;
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

      {/* Main Content */}
      <main className="flex-1">
        <>
          {/* Search Section */}
          <SearchSection site={site} />

          {/* Featured Properties Section */}
          <FeaturedProperties site={site} />

          {/* Testimonials Section */}
          <TestimonialsBlock
            data={
              siteData?.blocks?.find((b) => b.type === "testimonials")?.data ||
              defaultHomeContent.testimonials
            }
          />

          {/* Services Section */}
          <ServicesBlock
            data={
              siteData?.blocks?.find((b) => b.type === "services")?.data ||
              defaultHomeContent.services
            }
          />

          {/* Regular Blocks (excluding testimonials and services since we show them above) */}
          {blocks
            .filter(
              (block) => !["testimonials", "services"].includes(block.type)
            )
            .map((block, index) => (
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
  // Check if block has content before rendering
  const hasContent = (data: any) => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object") {
      return Object.values(data).some(
        (value) =>
          value &&
          (Array.isArray(value)
            ? value.length > 0
            : String(value).trim().length > 0)
      );
    }
    return String(data).trim().length > 0;
  };

  if (!hasContent(block.data)) return null;

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

function ServicesBlock({ data }: { data: any }) {
  const services = data.services || [];

  return (
    <section id="services" className="py-16 bg-gray-50">
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
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600">
            Real stories from real people who found their perfect homes
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center mb-6">
                <img
                  src={
                    testimonial.avatar ||
                    testimonial.image ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
                  }
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.title || testimonial.location || ""}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed italic">
                "{testimonial.comment || testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ data }: { data: any }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    if (!name || !message) {
      alert("Please fill in at least your name and message");
      return;
    }

    // Create WhatsApp message
    const whatsappNumber = data.whatsapp?.replace(/\D/g, "") || "";
    if (!whatsappNumber) {
      alert("WhatsApp number not configured. Please contact us directly.");
      return;
    }

    const whatsappMessage = `Hello! I'm ${name}.\n\n${message}\n\nContact: ${
      phone || "Not provided"
    }\nEmail: ${email || "Not provided"}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // Reset form
    e.currentTarget.reset();
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl text-gray-600">
            Get in touch with our expert team today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📞</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Call Us
                </h3>
                <p className="text-gray-600 mb-1">
                  {data.phone || "+254 700 123 456"}
                </p>
                <p className="text-sm text-gray-500">
                  {data.officeHours || "Mon-Fri: 9:00 AM - 6:00 PM"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  WhatsApp
                </h3>
                <p className="text-gray-600 mb-1">
                  {data.whatsapp || "+254 700 123 456"}
                </p>
                <p className="text-sm text-gray-500">
                  Quick responses, 24/7 availability
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-1">
                  {data.email || "info@youragency.com"}
                </p>
                <p className="text-sm text-gray-500">
                  We'll respond within 2 hours
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Visit Us
                </h3>
                <p className="text-gray-600">
                  {data.address ||
                    "123 Real Estate Avenue, Nairobi Central Business District, Kenya"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="name"
                  type="text"
                  placeholder="Your Name *"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us about your property needs... *"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ data }: { data: any }) {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">About Us</h2>
          <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
            <p className="text-lg mb-6">
              {data.content ||
                data.description ||
                "With extensive experience in the Kenyan real estate market, we've helped thousands of families and investors find their perfect property. Our deep understanding of local neighborhoods, market trends, and regulatory requirements ensures you get the best value and peace of mind in every transaction."}
            </p>
            <p className="text-lg mb-6">
              We combine traditional real estate expertise with modern
              technology to provide transparent, efficient service. Whether
              you're buying your first home, investing in commercial property,
              or relocating to Nairobi, our team of certified professionals is
              committed to making your real estate journey successful.
            </p>
            <p className="text-lg">
              From initial consultation through final handover, we maintain the
              highest standards of professionalism and integrity. We're not just
              agents – we're your trusted partners in building your future in
              Kenya's dynamic property market.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Properties Sold</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">98%</div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">5+</div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
        </div>

        {/* Additional content if provided */}
        {(data.features || data.promise) && (
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {data.features && data.features.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Why Choose Us
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {data.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-emerald-600 mr-3 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.promise && (
              <div className="bg-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Our Promise
                </h3>
                <p className="text-gray-600 mb-4">{data.promise}</p>
                {data.signature && (
                  <div className="text-sm text-emerald-700 font-medium">
                    - {data.signature}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
