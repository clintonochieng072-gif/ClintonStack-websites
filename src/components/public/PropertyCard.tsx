// src/components/public/PropertyCard.tsx
import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  property: {
    id?: string;
    title: string;
    price: number;
    location: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    image?: string;
    images?: string[];
    excerpt?: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const {
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    image,
    images,
    excerpt,
  } = property;

  // Use images array if available, otherwise fallback to single image
  const displayImages =
    images && images.length > 0 ? images : image ? [image] : [];

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
      <div className="relative h-64">
        {displayImages.length > 0 ? (
          <div className="w-full h-full overflow-x-auto flex snap-x snap-mandatory">
            {displayImages.map((img, index) => (
              <div
                key={index}
                className="relative w-full h-full flex-shrink-0 snap-center"
              >
                <Image
                  src={img}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">No image</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
          KES {price?.toLocaleString()}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {location}
        </p>
        {excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{excerpt}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {bedrooms && <span>Beds: {bedrooms}</span>}
            {bathrooms && <span>Bathrooms: {bathrooms}</span>}
            {area && <span>Square Feet: {area}</span>}
          </div>
          <Link
            href="#contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
