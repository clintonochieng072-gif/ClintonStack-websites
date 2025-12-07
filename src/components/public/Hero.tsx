// src/components/public/Hero.tsx
"use client";

import Image from "next/image";
import { ArrowRight, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { defaultHomeContent } from "@/data/defaultHomeContent";

interface HeroProps {
  site: any;
}

export default function Hero({ site }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // For preview mode, read from userWebsite.data, for live mode read from publishedWebsite.data
  const isPreview = !site.publishedWebsite?.data;
  const siteData = isPreview
    ? site.userWebsite?.data
    : site.publishedWebsite?.data;
  const customBlocks = siteData?.blocks || [];
  const customBlocksMap = new Map(
    customBlocks.map((block: any) => [block.type, block])
  );

  // Check if there's custom hero data
  const customHeroBlock = customBlocksMap.get("hero") as any;
  let heroData = defaultHomeContent.hero;

  if (customHeroBlock?.data) {
    // Merge custom data with defaults
    heroData = {
      title:
        customHeroBlock.data.title !== undefined
          ? customHeroBlock.data.title
          : defaultHomeContent.hero.title,
      subtitle:
        customHeroBlock.data.subtitle !== undefined
          ? customHeroBlock.data.subtitle
          : defaultHomeContent.hero.subtitle,
      ctaText:
        customHeroBlock.data.ctaText !== undefined
          ? customHeroBlock.data.ctaText
          : defaultHomeContent.hero.ctaText,
      heroImage:
        customHeroBlock.data.heroImage !== undefined
          ? customHeroBlock.data.heroImage
          : defaultHomeContent.hero.heroImage,
    };
  }

  const { title, subtitle, ctaText, heroImage } = heroData;

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Simulate search API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Here you would typically call the search API
      console.log("Searching for:", searchQuery);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => scrollToSection("properties")}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              // Handle list property action
              console.log("List property clicked");
              // You could redirect to a listing page or open a modal
            }}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border-2 border-white hover:bg-blue-50 active:bg-blue-100 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
          >
            List Your Property
          </button>
        </div>

        {/* Quick Search */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search locations, property types..."
                className="w-full outline-none text-gray-700 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
