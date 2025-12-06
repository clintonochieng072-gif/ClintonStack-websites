// src/components/public/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Search,
  MapPin,
  Home,
  Building,
  Car,
  Wrench,
  Briefcase,
  Camera,
  Heart,
  Users,
  Star,
} from "lucide-react";

interface HeaderProps {
  site: any;
}

const propertyTypes = [
  { id: "all", name: "All Properties", icon: Home },
  { id: "house", name: "Houses", icon: Home },
  { id: "apartment", name: "Apartments", icon: Building },
  { id: "condo", name: "Condos", icon: Building },
  { id: "townhouse", name: "Townhouses", icon: Building },
  { id: "land", name: "Land", icon: MapPin },
];

export default function Header({ site }: HeaderProps) {
  const logo =
    site.publishedWebsite?.data?.theme?.logo ||
    site.publishedWebsite?.data?.logo ||
    site.logo;
  const title = site.title || "ClintonStack";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a
                href="#home"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="#properties"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Properties
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Services
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
            </nav>

            {/* CTA Button */}
            <div className="ml-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                List Property
              </button>
            </div>
          </div>
        </div>

        {/* Property Type Filters */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  Browse by Type:
                </span>
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedCategory(type.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === type.id
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>🏠 150+ Properties</span>
                <span>⭐ 4.8/5 Rating</span>
                <span>🏆 Trusted Since 2020</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
