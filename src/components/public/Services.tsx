// src/components/public/Services.tsx
interface ServicesProps {
  data: any;
}

export default function Services({ data }: ServicesProps) {
  const services = data?.services || data?.items || [];

  if (!services || services.length === 0) {
    return null; // Don't render if no services
  }

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional real estate services tailored to meet your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any, index: number) => (
            <div
              key={service.id || index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-blue-600 text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-xl mb-4 text-gray-900">
                {service.title || service.name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description || service.text}
              </p>
              {service.price && (
                <p className="mt-4 text-2xl font-bold text-blue-600">
                  From KES {service.price?.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
