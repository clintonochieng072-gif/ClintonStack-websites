// src/components/public/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

interface FooterProps {
  site: any;
}

export default function Footer({ site }: FooterProps) {
  // For preview mode, read from userWebsite.data, for live mode read from publishedWebsite.data
  const isPreview = !site.publishedWebsite?.data;
  const siteData = isPreview
    ? site.userWebsite?.data
    : site.publishedWebsite?.data;
  const customBlocks = siteData?.blocks || [];
  const customBlocksMap = new Map(
    customBlocks.map((block: any) => [block.type, block])
  );

  // Get contact info from contact block
  const contactBlock = customBlocksMap.get("contact") as any;
  const contactData = contactBlock?.data || {};

  const logo = siteData?.theme?.logo || siteData?.logo || site.logo;
  const title = site.title || "ClintonStack";

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
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
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
              )}
              <div>
                <span className="font-bold text-2xl">{title}</span>
                <p className="text-emerald-400 text-sm">Premium Real Estate</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner in finding exceptional properties across
              Kenya. We combine local expertise with premium service to help you
              discover your perfect home.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/kenyaproperties"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com/kenyaproperties"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com/kenyaproperties"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/company/kenyaproperties"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
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
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#properties"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="hover:text-emerald-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {(contactData.phone || contactData.whatsapp || contactData.email) && (
            <div>
              <h3 className="font-semibold mb-6 text-lg">Contact Info</h3>
              <ul className="space-y-3 text-gray-300">
                {contactData.phone && (
                  <li className="flex items-center">
                    <span className="mr-3 text-emerald-400">📞</span>
                    <Link
                      href={`tel:${contactData.phone}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {contactData.phone}
                    </Link>
                  </li>
                )}
                {contactData.whatsapp && (
                  <li className="flex items-center">
                    <span className="mr-3 text-emerald-400">💬</span>
                    <Link
                      href={`https://wa.me/${contactData.whatsapp.replace(/\D/g, '')}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      WhatsApp
                    </Link>
                  </li>
                )}
                {contactData.email && (
                  <li className="flex items-center">
                    <span className="mr-3 text-emerald-400">📧</span>
                    <Link
                      href={`mailto:${contactData.email}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {contactData.email}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} {title}. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-500 text-xs">
                Powered by{" "}
                <span className="text-emerald-400">ClintonStack</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
