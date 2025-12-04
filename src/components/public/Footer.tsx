// src/components/public/Footer.tsx
import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  site: any;
}

export default function Footer({ site }: FooterProps) {
  const logo = site.theme?.logo || site.logo;
  const title = site.title || "ClintonStack";

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
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
            <p className="text-gray-400 mb-4">
              Professional real estate services to help you find your perfect
              home. Trusted by clients worldwide.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
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
                  href="#gallery"
                  className="hover:text-white transition-colors"
                >
                  Gallery
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
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              {site.data?.contactInformation?.email && (
                <li>
                  <Link
                    href={`mailto:${site.data.contactInformation.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {site.data.contactInformation.email}
                  </Link>
                </li>
              )}
              {site.data?.contactInformation?.phoneNumber && (
                <li>
                  <Link
                    href={`tel:${site.data.contactInformation.phoneNumber}`}
                    className="hover:text-white transition-colors"
                  >
                    {site.data.contactInformation.phoneNumber}
                  </Link>
                </li>
              )}
              {site.data?.contactInformation?.address && (
                <li>{site.data.contactInformation.address}</li>
              )}
              {!site.data?.contactInformation?.email &&
                !site.data?.contactInformation?.phoneNumber &&
                !site.data?.contactInformation?.address && (
                  <li>
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
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {title}. All rights reserved.
            Powered by ClintonStack.
          </p>
        </div>
      </div>
    </footer>
  );
}
