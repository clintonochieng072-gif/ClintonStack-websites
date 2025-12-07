// src/components/public/PropertiesSection.tsx
import Image from "next/image";

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
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Properties</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our exclusive property listings
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: any, i: number) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Property Images - Full View */}
              {property.images && property.images.length > 0 && (
                <div className="relative">
                  {property.images.length === 1 ? (
                    // Single image - full view
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                  ) : (
                    // Multiple images - carousel
                    <div className="w-full overflow-x-auto flex snap-x snap-mandatory">
                      {property.images.map(
                        (image: string, imgIndex: number) => (
                          <Image
                            key={imgIndex}
                            src={image}
                            alt={`${property.title} - Image ${imgIndex + 1}`}
                            width={800}
                            height={600}
                            className="w-full h-auto object-cover flex-shrink-0 snap-center min-w-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Property Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h3>
                <p className="text-gray-600 mb-3 flex items-center">
                  <span className="text-lg mr-1">📍</span>
                  {property.location}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${property.price?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {property.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  {property.bedrooms && <div>Beds: {property.bedrooms}</div>}
                  {property.bathrooms && (
                    <div>Bathrooms: {property.bathrooms}</div>
                  )}
                  {property.sqft && <div>Square Feet: {property.sqft}</div>}
                </div>

                {property.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {property.description.length > 120
                      ? `${property.description.substring(0, 120)}...`
                      : property.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
