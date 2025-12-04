// src/components/public/ContactCTA.tsx
import Link from "next/link";

interface ContactCTAProps {
  data: any;
}

export default function ContactCTA({ data }: ContactCTAProps) {
  if (!data) {
    return null; // Don't render if no data
  }

  return (
    <section id="contact" className="py-20 bg-blue-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Find Your Dream Home?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Contact us today to get started on your real estate journey. Our
          expert team is here to help you every step of the way.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`tel:${data.phone || "+1234567890"}`}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Call Now: {data.phone || "+1 (555) 123-4567"}
          </Link>
          <Link
            href={`mailto:${data.email || "contact@example.com"}`}
            className="bg-blue-500 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Email Us
          </Link>
        </div>
        <div className="mt-8 text-blue-100">
          <p>{data.address || "123 Business St, City, State 12345"}</p>
        </div>
      </div>
    </section>
  );
}
