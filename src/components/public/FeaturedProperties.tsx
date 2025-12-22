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

  // Get featured properties from the site's properties block
  const propertiesBlock = siteData?.blocks?.find(
    (b: any) => b.type === "properties"
  );
  const allProperties = propertiesBlock?.data?.properties || [];
  const featuredProperties = allProperties.slice(0, 3); // Show first 3 as featured

  if (featuredProperties.length === 0) return null;

  return (
    <section id="properties" className="py-16 bg-white">
      <div className="max-w-full mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked premium listings just for you
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 overflow-x-auto">
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
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {property.images && property.images.length > 0 && (
                  <div className="relative overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-3 flex items-center">
                    <span className="text-lg mr-1">📍</span>
                    {property.location}
                  </p>

                  {/* Features Section - Vertical List */}
                  <div className="mb-4 space-y-1">
                    {property.bedrooms && (
                      <div className="text-sm text-gray-600">
                        Beds: {property.bedrooms}
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="text-sm text-gray-600">
                        Bathrooms: {property.bathrooms}
                      </div>
                    )}
                    {property.sqft && (
                      <div className="text-sm text-gray-600">
                        Square feet: {property.sqft} sqft
                      </div>
                    )}
                    {property.propertyType && (
                      <div className="text-sm text-gray-600 capitalize">
                        Type:{" "}
                        {String(property.propertyType).split("-").join(" ")}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {property.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {property.description}
                    </p>
                  )}

                  {/* Price and Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-600">
                      KES{" "}
                      {property.price
                        ? Number(property.price).toLocaleString()
                        : "0"}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                      {property.status
                        ? String(property.status).split("-").join(" ")
                        : "Unknown"}
                    </span>
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
