import React from "react";

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
    <section id="properties" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exceptional homes that match your lifestyle and dreams
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property: any, index: number) => (
            <div
              key={property._id || property.id || index}
              className="group cursor-pointer"
              onClick={() => {
                // Scroll to contact section for inquiries
                const contactElement = document.getElementById("contact");
                if (contactElement) {
                  contactElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100">
                {property.images && property.images.length > 0 && (
                  <div className="relative overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/cccccc/000000?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Verified
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {property.title}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize ml-2 flex-shrink-0">
                      {property.status
                        ? String(property.status).split("-").join(" ")
                        : "Available"}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 flex items-center text-sm">
                    <span className="text-base mr-2">📍</span>
                    {property.location}
                  </p>

                  {/* Key Features - Horizontal Layout */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <span className="mr-1">🛏️</span>
                          {property.bedrooms} bed
                          {property.bedrooms !== 1 ? "s" : ""}
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center">
                          <span className="mr-1">🛁</span>
                          {property.bathrooms} bath
                          {property.bathrooms !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    {property.sqft && (
                      <div className="text-right">{property.sqft} sqft</div>
                    )}
                  </div>

                  {/* Price - Prominent */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-emerald-600">
                        {property.price
                          ? Number(property.price).toLocaleString()
                          : "0"}
                      </span>
                      {property.propertyType && (
                        <div className="text-xs text-gray-500 capitalize mt-1">
                          {String(property.propertyType).split("-").join(" ")}
                        </div>
                      )}
                    </div>
                    <div className="text-emerald-600 group-hover:translate-x-1 transition-transform duration-300">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
