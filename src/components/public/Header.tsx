// src/components/public/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      const sections = ["home", "properties", "about", "testimonials", "contact"];
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
      {/* Top Bar - NOT sticky */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>📞 Call us: (555) 123-4567</span>
              <span>📧 info@clintonstack.com</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Mon-Fri: 9AM-6PM</span>
              <span>Sat: 10AM-4PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Header - Main navigation and filters */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        {/* Main Header */}
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
              )}
              <div>
                <h1 className="font-bold text-2xl text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">Real Estate Excellence</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("home")}
                className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "home"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : ""
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("properties")}
                className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "properties"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : ""
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "about"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : ""
                }`}
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "testimonials"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : ""
                }`}
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "contact"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : ""
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <nav className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => {
                    scrollToSection("home");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                    activeSection === "home" ? "text-blue-600" : ""
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    scrollToSection("properties");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                    activeSection === "properties" ? "text-blue-600" : ""
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => {
                    scrollToSection("about");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                    activeSection === "about" ? "text-blue-600" : ""
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => {
                    scrollToSection("testimonials");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                    activeSection === "testimonials" ? "text-blue-600" : ""
                  }`}
                >
                  Testimonials
                </button>
                <button
                  onClick={() => {
                    scrollToSection("contact");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                    activeSection === "contact" ? "text-blue-600" : ""
                  }`}
                >
                  Contact
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
