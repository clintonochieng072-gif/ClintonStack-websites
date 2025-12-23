// src/components/public/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  site: any;
}

export default function Header({ site }: HeaderProps) {
  // For preview mode, read from userWebsite.data, for live mode read from publishedWebsite.data
  const isPreview = !site.publishedWebsite?.data;
  const siteData = isPreview
    ? site.userWebsite?.data
    : site.publishedWebsite?.data;

  const logo = siteData?.theme?.logo || siteData?.logo || site.logo;
  const title = site.title || "ClintonStack";
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "home",
        "properties",
        "about",
        "testimonials",
        "contact",
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Sticky Header - Clean and minimal */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              {logo ? (
                <Image
                  src={logo}
                  alt={title}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
              )}
              <div>
                <h1 className="font-bold text-xl text-gray-900">{title}</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Premium Real Estate</p>
              </div>
            </div>

            {/* Desktop Navigation - Minimal */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={() => scrollToSection("home")}
                className={`text-gray-700 hover:text-emerald-600 transition-colors font-medium text-sm ${
                  activeSection === "home"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("properties")}
                className={`text-gray-700 hover:text-emerald-600 transition-colors font-medium text-sm ${
                  activeSection === "properties"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className={`text-gray-700 hover:text-emerald-600 transition-colors font-medium text-sm ${
                  activeSection === "about"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`text-gray-700 hover:text-emerald-600 transition-colors font-medium text-sm ${
                  activeSection === "contact"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <a
                href="tel:+254700123456"
                className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <span className="text-lg">📞</span>
                <span className="font-medium text-sm">+254 700 123 456</span>
              </a>
              <a
                href="https://wa.me/254700123456"
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Mobile Contact & Menu */}
            <div className="flex items-center space-x-2 md:hidden">
              <a
                href="tel:+254700123456"
                className="p-2 text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <span className="text-lg">📞</span>
              </a>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col space-y-2 px-6 py-4">
              <button
                onClick={() => {
                  scrollToSection("home");
                  setMenuOpen(false);
                }}
                className={`text-left text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 ${
                  activeSection === "home"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  scrollToSection("properties");
                  setMenuOpen(false);
                }}
                className={`text-left text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 ${
                  activeSection === "properties"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => {
                  scrollToSection("about");
                  setMenuOpen(false);
                }}
                className={`text-left text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 ${
                  activeSection === "about"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection("contact");
                  setMenuOpen(false);
                }}
                className={`text-left text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 ${
                  activeSection === "contact"
                    ? "text-emerald-600"
                    : ""
                }`}
              >
                Contact
              </button>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <a
                  href="https://wa.me/254700123456"
                  className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <span>💬</span>
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
