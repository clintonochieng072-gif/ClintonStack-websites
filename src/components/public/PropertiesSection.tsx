// src/components/public/PropertiesSection.tsx
import Image from "next/image";
import { motion } from "framer-motion";

interface PropertiesSectionProps {
  data: any;
}

export default function PropertiesSection({ data }: PropertiesSectionProps) {
  const properties =
    data?.list ||
    data?.properties?.list ||
    (data?.properties && Array.isArray(data.properties)
      ? data.properties
      : []) ||
    [];

  return (
    <section id="properties" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Properties</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our exclusive property listings
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Property Image */}
              {property.images && property.images.length > 0 && (
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      {property.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Property Details */}
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-emerald-600">
                    KSh {property.price?.toLocaleString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h3>

                <p className="text-gray-600 mb-4 flex items-center">
                  <span className="text-lg mr-2">📍</span>
                  {property.location}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  {property.beds && (
                    <div className="flex items-center">
                      <span className="mr-1">🛏️</span>
                      {property.beds} beds
                    </div>
                  )}
                  {property.baths && (
                    <div className="flex items-center">
                      <span className="mr-1">🛁</span>
                      {property.baths} baths
                    </div>
                  )}
                  {property.size && (
                    <div className="flex items-center">
                      <span className="mr-1">📐</span>
                      {property.size} sq ft
                    </div>
                  )}
                </div>

                {property.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mt-4">
                    {property.description.length > 120
                      ? `${property.description.substring(0, 120)}...`
                      : property.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
