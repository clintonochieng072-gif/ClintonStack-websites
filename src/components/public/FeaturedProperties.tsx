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
  const customBlocks = siteData?.blocks || [];
  const customBlocksMap = new Map(
    customBlocks.map((block: any) => [block.type, block])
  );

  // Get properties from the site's properties block
  const propertiesBlock = customBlocksMap.get("properties") as any;
  const propertiesData = propertiesBlock?.data || {};
  const allProperties = propertiesData.properties || propertiesData.list || [];
  const sectionTitle = propertiesData.title || "Our Properties";

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (allProperties.length === 0) return null;

  return (
    <section id="properties" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exceptional properties that match your lifestyle and budget
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProperties.map((property: any, index: number) => (
            <div
              key={property._id || property.id || index}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image"
                  }
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                {property.status && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {String(property.status).split("-").join(" ").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center text-emerald-600 mb-3">
                  <span className="text-2xl font-bold">
                    {property.price
                      ? `KSh ${Number(property.price).toLocaleString()}`
                      : "Price on request"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <span className="text-lg mr-2">📍</span>
                  <span className="text-sm">{property.location || "Location not specified"}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
                  {property.bedrooms && (
                    <span className="flex items-center">
                      <span className="mr-1">🛏️</span>
                      {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center">
                      <span className="mr-1">🛁</span>
                      {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                    </span>
                  )}
                  {property.sqft && (
                    <span className="flex items-center">
                      <span className="mr-1">📐</span>
                      {property.sqft} sqft
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
