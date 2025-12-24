import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PropertyModal from "./PropertyModal";

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

  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

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
            <motion.div
              key={property._id || property.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Property Image */}
              <div
                className="relative h-64 w-full cursor-pointer"
                onClick={() => handlePropertyClick(property)}
              >
                <Image
                  src={
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image"
                  }
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Status Badge */}
                {property.status && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {property.status.replace("-", " ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-bold text-emerald-600">
                    KSh {property.price?.toLocaleString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h3>

                <p className="text-gray-600 mb-4 flex items-center">
                  <span className="text-lg mr-2">📍</span>
                  {property.location || "Location not specified"}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <span className="mr-1">🛏️</span>
                      {property.bedrooms} beds
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <span className="mr-1">🛁</span>
                      {property.bathrooms} baths
                    </div>
                  )}
                  {property.sqft && (
                    <div className="flex items-center">
                      <span className="mr-1">📐</span>
                      {property.sqft} sq ft
                    </div>
                  )}
                </div>

                {property.propertyType && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      Property Type:{" "}
                    </span>
                    <span className="text-sm text-gray-700 capitalize">
                      {property.propertyType}
                    </span>
                  </div>
                )}

                {property.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {property.description.length > 150
                      ? `${property.description.substring(0, 150)}...`
                      : property.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Property Modal */}
        <PropertyModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  );
}
