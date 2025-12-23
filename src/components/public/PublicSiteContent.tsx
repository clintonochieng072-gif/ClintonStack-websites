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
    <section className="py-16 bg-gradient-to-r from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Kenya Properties?
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your trusted partner in finding the perfect home across Kenya's most
            desirable locations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-sm text-gray-600">Verified Properties</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">4.9/5</div>
            <div className="text-sm text-gray-600">Client Rating</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">10+</div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
            <div className="text-sm text-gray-600">Secure Transactions</div>
          </div>
        </div>

        {/* Agent Showcase */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h4 className="text-xl font-bold text-gray-900 mb-6">
            Meet Our Expert Agents
          </h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
                alt="Agent"
                className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
              />
              <div className="font-semibold text-gray-900">David Kiprop</div>
              <div className="text-sm text-gray-600">Senior Agent</div>
              <div className="text-xs text-emerald-600 mt-1">
                15+ years experience
              </div>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
                alt="Agent"
                className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
              />
              <div className="font-semibold text-gray-900">Sarah Wanjiku</div>
              <div className="text-sm text-gray-600">Luxury Specialist</div>
              <div className="text-xs text-emerald-600 mt-1">
                12+ years experience
              </div>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
                alt="Agent"
                className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
              />
              <div className="font-semibold text-gray-900">Grace Achieng</div>
              <div className="text-sm text-gray-600">Investment Advisor</div>
              <div className="text-xs text-emerald-600 mt-1">
                10+ years experience
              </div>
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
                    testimonial.image ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                  }
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.location || "Kenya"}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ data }: { data: any }) {
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
                  {data.officeHours || "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"}
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
                  {data.email || "hello@kenyaproperties.com"}
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
                  {data.address || "Westlands, Nairobi, Kenya"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h3>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
              <textarea
                rows={4}
                placeholder="Tell us about your property needs..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Send Message
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
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {data.profilePhoto && (
              <div className="mb-8">
                <img
                  src={data.profilePhoto}
                  alt="Our Team"
                  className="w-48 h-48 rounded-2xl mx-auto md:mx-0 object-cover shadow-2xl"
                />
              </div>
            )}
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Your Local Real Estate Experts
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {data.content || data.description}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  1500+
                </div>
                <div className="text-sm text-gray-600">Happy Families</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  98%
                </div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Why We're Different
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>
                    Deep local market knowledge across all Kenyan cities
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Personalized service tailored to your needs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Transparent pricing with no hidden fees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>End-to-end support from search to settlement</span>
                </li>
              </ul>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Our Promise
              </h3>
              <p className="text-gray-600">
                "We don't just sell properties – we help you find your home.
                Every client relationship is built on trust, transparency, and
                genuine care for your real estate goals."
              </p>
              <div className="mt-4 text-sm text-emerald-700 font-medium">
                - Kenya Properties Team
              </div>
            </div>
          </div>
        </div>
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
