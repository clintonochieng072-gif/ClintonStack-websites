// src/components/public/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

interface FooterProps {
  site: any;
}

export default function Footer({ site }: FooterProps) {
  const logo = site.userWebsite?.data?.theme?.logo || site.userWebsite?.data?.logo || site.logo;
  const title = site.title || "ClintonStack";

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              {logo ? (
                <Image
                  src={logo}
                  alt={title}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">👑</span>
                </div>
              )}
              <div>
                <span className="font-bold text-2xl">{title}</span>
                <p className="text-blue-400 text-sm">Real Estate Excellence</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Professional real estate services to help you find your perfect
              home. Trusted by clients worldwide with verified listings and expert guidance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link
                  href="#home"
                  className="hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#properties"
                  className="hover:text-white transition-colors"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-6 text-lg">Contact Info</h3>
            <ul className="space-y-3 text-gray-300">
              {site.userWebsite?.data?.contactInformation?.email && (
                <li className="flex items-center">
                  <span className="mr-2">📧</span>
                  <Link
                    href={`mailto:${site.userWebsite.data.contactInformation.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {site.userWebsite.data.contactInformation.email}
                  </Link>
                </li>
              )}
              {site.userWebsite?.data?.contactInformation?.phoneNumber && (
                <li className="flex items-center">
                  <span className="mr-2">📞</span>
                  <Link
                    href={`tel:${site.userWebsite.data.contactInformation.phoneNumber}`}
                    className="hover:text-white transition-colors"
                  >
                    {site.userWebsite.data.contactInformation.phoneNumber}
                  </Link>
                </li>
              )}
              {site.userWebsite?.data?.contactInformation?.address && (
                <li className="flex items-start">
                  <span className="mr-2 mt-1">📍</span>
                  <span>{site.userWebsite.data.contactInformation.address}</span>
                </li>
              )}
              {!site.userWebsite?.data?.contactInformation?.email &&
                !site.userWebsite?.data?.contactInformation?.phoneNumber &&
                !site.userWebsite?.data?.contactInformation?.address && (
                  <li className="flex items-center">
                    <span className="mr-2">📧</span>
                    <Link
                      href="mailto:contact@clintonstack.com"
                      className="hover:text-white transition-colors"
                    >
                      contact@clintonstack.com
                    </Link>
                  </li>
                )}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} {title}. All rights reserved.
              <span className="hidden md:inline"> • </span>
              <span className="block md:inline mt-2 md:mt-0">Powered by ClintonStack</span>
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
