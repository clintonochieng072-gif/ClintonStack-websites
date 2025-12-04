// src/components/public/Hero.tsx
import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  data: any;
}

export default function Hero({ data }: HeroProps) {
  const title = data?.title || "Find Your Dream Home";
  const subtitle =
    data?.subtitle ||
    "Professional real estate services tailored to your needs";
  const ctaText = data?.ctaText || "View Properties";
  const heroImage = data?.heroImage;

  return (
    <section
      id="home"
      className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"
    >
      {heroImage && (
        <Image
          src={heroImage}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="#properties"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
          >
            {ctaText}
          </Link>
          <Link
            href="#contact"
            className="bg-white hover:bg-gray-100 text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg border-2 border-white"
          >
            Contact Us
          </Link>
        </div>
        {/* Optional search UI */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">
              Search Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Location"
                className="px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                placeholder="Price range"
                className="px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
