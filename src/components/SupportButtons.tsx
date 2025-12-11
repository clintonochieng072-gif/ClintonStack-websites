"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";

export default function SupportButtons() {
  const phoneNumber = "+254768524480";

  const handlePhoneCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    const message = "Hello, I need help with ClintonStack!";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Phone Button */}
      <button
        onClick={handlePhoneCall}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        title="Call Support"
      >
        <Phone className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Need Help? Call Us
        </span>
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        title="WhatsApp Support"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Support via WhatsApp
        </span>
      </button>
    </div>
  );
}