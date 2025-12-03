"use client";

interface AboutSectionProps {
  text: string;
}

export default function AboutSection({ text }: AboutSectionProps) {
  return (
    <section className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">About Us</h2>
          <p className="mt-4 max-w-3xl mx-auto text-slate-600">{text}</p>
        </div>
      </div>
    </section>
  );
}
