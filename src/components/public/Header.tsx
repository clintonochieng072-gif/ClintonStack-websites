// src/components/public/Header.tsx
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  site: any;
}

export default function Header({ site }: HeaderProps) {
  const logo = site.data?.theme?.logo || site.data?.logo || site.logo;
  const title = site.title || "ClintonStack";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {logo ? (
              <Image
                src={logo}
                alt={title}
                width={32}
                height={32}
                className="rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
            )}
            <span className="font-bold text-xl">{title}</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </a>
            <a
              href="#services"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Services
            </a>
            <a
              href="#gallery"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Gallery
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center space-x-4"></div>
        </div>
      </div>
    </header>
  );
}
