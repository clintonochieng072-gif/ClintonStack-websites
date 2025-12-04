// src/components/public/About.tsx
import Image from "next/image";

interface AboutProps {
  data: any;
}

export default function About({ data }: AboutProps) {
  if (!data || (!data.bio && !data.description)) {
    return null; // Don't render if no data
  }

  const title = data.title || "About Us";
  const description =
    data.bio ||
    data.description ||
    "We are committed to providing exceptional real estate services.";
  const profilePhoto = data.profilePhoto || data.logo;

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            {profilePhoto && (
              <Image
                src={profilePhoto}
                alt="About us"
                width={500}
                height={400}
                className="w-full max-w-md mx-auto lg:mx-0 rounded-lg shadow-lg"
              />
            )}
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {description}
            </p>
            {data.experience && (
              <div className="mb-4">
                <span className="font-semibold text-gray-900">Experience:</span>
                <span className="text-gray-600 ml-2">
                  {data.experience} years in real estate
                </span>
              </div>
            )}
            {data.certifications && (
              <div className="mb-4">
                <span className="font-semibold text-gray-900">
                  Certifications:
                </span>
                <span className="text-gray-600 ml-2">
                  {data.certifications}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
