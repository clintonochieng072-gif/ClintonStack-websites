"use client";

import React from "react";
import { Phone, MessageCircle } from "lucide-react";

interface FloatingButtonsProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

export default function FloatingButtons({ phoneNumber, whatsappNumber }: FloatingButtonsProps) {
  // Don't render if neither phone nor WhatsApp is configured
  if (!phoneNumber && !whatsappNumber) {
    return null;
  }

  const handlePhoneClick = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      // Remove any non-numeric characters and ensure it starts with +
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Button */}
      {whatsappNumber && (
        <button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat on WhatsApp
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </button>
      )}

      {/* Phone Button */}
      {phoneNumber && (
        <button
          onClick={handlePhoneClick}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          aria-label="Call us"
        >
          <Phone className="w-6 h-6" />
          <div className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Call us
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </button>
      )}
    </div>
  );
}
