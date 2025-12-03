"use client";

import React from "react";
import { realEstateDefaults } from "../defaultContent";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import PropertiesSection from "../components/PropertiesSection";
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

type Property = {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: string;
  images?: string[];
  status?: string;
  description?: string;
};

const defaultProperties: Property[] = [];

export default function RealEstatePage({
  data,
  colors,
}: {
  data?: any;
  colors?: any;
}) {
  const defaultColors = {
    primary: "#007bff",
    secondary: "#6c757d",
    background: "#ffffff",
  };
  const themeColors = colors || defaultColors;

  const content = data
    ? {
        heroTitle: data.hero?.title || realEstateDefaults.heroTitle,
        heroSubtitle: data.hero?.subtitle || realEstateDefaults.heroSubtitle,
        about: data.about?.text || realEstateDefaults.about,
        services: data.services?.list || realEstateDefaults.services,
        testimonials:
          data.testimonials?.list || realEstateDefaults.testimonials,
        footerText: data.footer?.text || realEstateDefaults.footerText,
      }
    : realEstateDefaults;
  const [properties, setProperties] = React.useState(
    data?.properties?.list || defaultProperties
  );

  const handleSearch = async (formData: any) => {
    const res = await fetch(
      `/api/properties/search?${new URLSearchParams(formData)}`
    );
    const data = await res.json();
    setProperties(data);
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: themeColors.background,
        color: "#007bff",
      }}
    >
      <Header />
      <HeroSection
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        onSearch={handleSearch}
      />
      <PropertiesSection properties={properties} />
      <AboutSection text={content.about} />
      <ServicesSection services={content.services} />
      <TestimonialsSection testimonials={content.testimonials} />
      <ContactSection data={data?.contact} />
      <Footer text={content.footerText} />
    </main>
  );
}
