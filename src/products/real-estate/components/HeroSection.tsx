"use client";

import React from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  onSearch: (formData: any) => void;
}

export default function HeroSection({
  title,
  subtitle,
  onSearch,
}: HeroSectionProps) {
  return (
    <section className="pt-[100px] pb-2 text-center">
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h1>

      <motion.p
        className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        {subtitle}
      </motion.p>

      <div className="pt-2 pb-4">
        <SearchBar onSearch={onSearch} />
      </div>
    </section>
  );
}
