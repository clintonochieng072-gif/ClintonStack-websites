"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

interface PropertiesSectionProps {
  properties: Property[];
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.article
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200"
      whileHover={{ translateY: -6 }}
    >
      <div className="relative h-[26rem] w-full">
        <img
          src={property.images?.[0] || "/placeholder-property.jpg"}
          alt={property.title}
          className="w-full h-full object-contain"
        />
        <span className="absolute top-3 left-3 bg-white/90 text-xs px-3 py-1 rounded-full font-medium">
          {property.location}
        </span>
        {property.status && (
          <span className="absolute bottom-3 right-3 bg-white/90 text-xs px-3 py-1 rounded-full font-medium border">
            {property.status}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">{property.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="text-slate-600 text-sm flex items-center gap-3">
            <div className="flex items-center gap-1">
              {property.bedrooms} beds
            </div>
            <div className="flex items-center gap-1">
              {property.bathrooms} baths
            </div>
            <div className="flex items-center gap-1">{property.sqft}</div>
          </div>

          <div className="text-right">
            <div className="text-blue-600 font-bold">{property.price}</div>
            <div className="text-xs text-slate-500">Quality: good</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function PropertiesSection({
  properties,
}: PropertiesSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 mt-4 mb-20">
      <SectionHeader
        title="Properties"
        subtitle="Discover our exclusive property listings"
      />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </motion.div>

      <div className="flex justify-center mt-8">
        <Link href="#" className="inline-block">
          <button className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 text-base md:text-lg">
            View All Properties
          </button>
        </Link>
      </div>
    </section>
  );
}
