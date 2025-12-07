// src/components/public/PropertiesGrid.tsx
import PropertyCard from "./PropertyCard";

interface PropertiesGridProps {
  data: any;
}

export default function PropertiesGrid({ data }: PropertiesGridProps) {
  const properties = data?.items || [];

  if (!properties || properties.length === 0) {
    return (
      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            No properties available yet.
          </p>
        </div>
      </section>
    );
  }

  // Limit to 6 for homepage
  const displayProperties = properties.slice(0, 6);

  return (
    <section id="properties" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your perfect home from our curated selection of premium
            properties
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayProperties.map((property: any, index: number) => (
            <PropertyCard key={property._id || property.id || index} property={property} />
          ))}
        </div>
        {properties.length > 6 && (
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              View All Properties
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
