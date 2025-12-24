// src/components/public/Hero.tsx
"use client";

import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { defaultHomeContent } from "@/data/defaultHomeContent";

interface HeroProps {
  site: any;
}

export default function Hero({ site }: HeroProps) {
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
      primaryCtaText:
        customHeroBlock.data.primaryCtaText !== undefined
          ? customHeroBlock.data.primaryCtaText
          : defaultHomeContent.hero.primaryCtaText,
      primaryCtaLink:
        customHeroBlock.data.primaryCtaLink !== undefined
          ? customHeroBlock.data.primaryCtaLink
          : defaultHomeContent.hero.primaryCtaLink,
      secondaryCtaText:
        customHeroBlock.data.secondaryCtaText !== undefined
          ? customHeroBlock.data.secondaryCtaText
          : defaultHomeContent.hero.secondaryCtaText,
      secondaryCtaLink:
        customHeroBlock.data.secondaryCtaLink !== undefined
          ? customHeroBlock.data.secondaryCtaLink
          : defaultHomeContent.hero.secondaryCtaLink,
      carouselImages:
        customHeroBlock.data.carouselImages !== undefined &&
        Array.isArray(customHeroBlock.data.carouselImages) &&
        customHeroBlock.data.carouselImages.length > 0
          ? customHeroBlock.data.carouselImages
          : defaultHomeContent.hero.carouselImages,
    };
  }

  const {
    title,
    subtitle,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    carouselImages,
  } = heroData;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCtaClick = (link?: string) => {
    if (link) {
      if (link.startsWith("#")) {
        scrollToSection(link.substring(1));
      } else if (link.startsWith("http")) {
        window.open(link, "_blank");
      } else {
        window.location.href = link;
      }
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Images */}
      {carouselImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        {(primaryCtaText || secondaryCtaText) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {primaryCtaText && (
              <button
                onClick={() => handleCtaClick(primaryCtaLink || "#properties")}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
              >
                {primaryCtaText}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            {secondaryCtaText && (
              <button
                onClick={() => handleCtaClick(secondaryCtaLink)}
                className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border-2 border-white hover:bg-white hover:text-emerald-600 active:bg-emerald-100 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
              >
                {secondaryCtaText}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
