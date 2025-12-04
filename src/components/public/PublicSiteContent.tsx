import React from "react";

interface Block {
  type: string;
  data: any;
}

interface Site {
  title: string;
  userWebsite?: {
    data?: {
      blocks?: Block[];
    };
    integrations?: any;
  };
}

interface PublicSiteContentProps {
  site: Site;
}

export default function PublicSiteContent({ site }: PublicSiteContentProps) {
  const blocks = site.userWebsite?.data?.blocks || [];

  return (
    <div className="min-h-screen">
      {blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock data={block.data} />;
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
    default:
      return null;
  }
}

function HeroBlock({ data }: { data: any }) {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          {data.title || "Welcome"}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          {data.subtitle || "Your professional website"}
        </p>
        {data.ctaText && (
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {data.ctaText}
          </button>
        )}
      </div>
      {data.heroImage && (
        <div className="absolute inset-0 bg-black bg-opacity-30">
          <img
            src={data.heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </section>
  );
}

function ServicesBlock({ data }: { data: any }) {
  const services = data.services || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
        <div className="grid md:grid-cols-3 gap-4">
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Testimonials</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    <section className="py-16 bg-white">
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">About Us</h2>
        <p className="text-lg text-gray-600">{data.content || data.description}</p>
      </div>
    </section>
  );
}
