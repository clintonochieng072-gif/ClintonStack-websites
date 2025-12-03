"use client";

import Link from "next/link";

export default function Header() {
  console.log("HEADER VERSION 99");
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Testimonials", href: "/testimonials" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur bg-white/60 border-b border-slate-200 h-[100px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-2xl font-bold tracking-wide">Real Estate</span>
        </div>

        <nav className="hidden md:flex items-center space-x-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xl font-semibold hover:text-blue-600 transition-all px-2 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 md:px-8 md:py-4 rounded-xl text-lg md:text-xl font-semibold hover:bg-blue-50 transition-all">
            View Properties
          </button>
        </div>
      </div>
    </header>
  );
}
