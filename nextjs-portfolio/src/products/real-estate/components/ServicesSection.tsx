"use client";

import { motion } from "framer-motion";

interface ServicesSectionProps {
  services: string[];
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

export default function ServicesSection({ services }: ServicesSectionProps) {
  const items = services.map((service) => ({
    title: service,
    desc: `Professional ${service.toLowerCase()} services.`,
  }));

  return (
    <section className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeader
          title="Our Services"
          subtitle="We make property buying and selling simple"
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <motion.div
              key={it.title}
              className="bg-white rounded-xl p-6 shadow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-12 h-12 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="mt-4 font-semibold">{it.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
