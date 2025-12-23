import React from "react";
import Image from "next/image";

interface Site {
  title: string;
  integrations?: any;
  userWebsite?: {
    data?: {
      blocks?: any[];
    };
  };
  publishedWebsite?: {
    data?: {
      blocks?: any[];
    };
  };
}

interface FeaturedPropertiesProps {
  site: Site;
}

export default function FeaturedProperties({ site }: FeaturedPropertiesProps) {
  // For preview mode, read from userWebsite.data, for live mode read from publishedWebsite.data
  const isPreview = !site.publishedWebsite?.data;
  const siteData = isPreview
    ? site.userWebsite?.data
    : site.publishedWebsite?.data;

  // Get properties from the site's properties block
  const propertiesBlock = siteData?.blocks?.find(
    (b: any) => b.type === "properties"
  );
  const allProperties = propertiesBlock?.data?.properties || [];
  const featuredProperties = allProperties; // Show all properties

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (featuredProperties.length === 0) return null;

  return (
    <section id="properties" className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Featured Properties
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property: any, index: number) => (
            <div
              key={property._id || property.id || index}
              className="flex flex-col border rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-72 w-full">
                <Image
                  src={
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "https://via.placeholder.com/400x300/cccccc/000000?text=Image+Not+Found"
                  }
                  alt={property.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold">{property.title}</h3>
                <p className="text-lg font-bold text-emerald-600">
                  {property.price
                    ? `$${Number(property.price).toLocaleString()}`
                    : "Price not available"}
                </p>
                <p className="text-sm text-gray-600">{property.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
