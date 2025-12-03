"use client";

import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  text: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
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

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeader
          title="Testimonials"
          subtitle="What our clients say about us"
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-slate-600 italic">"{testimonial.text}"</p>
              <div className="mt-4 font-semibold">{testimonial.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
