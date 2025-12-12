"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, HelpCircle, ChevronUp } from "lucide-react";

interface FloatingButtonsProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

export default function FloatingButtons({ phoneNumber, whatsappNumber }: FloatingButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePhoneClick = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
    setIsOpen(false);
  };

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
    }
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    // Assume help center link
    window.open('/help', '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-1">
          {phoneNumber && (
            <button
              onClick={handlePhoneClick}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
          )}
          {whatsappNumber && (
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          )}
          <button
            onClick={handleHelpClick}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded"
          >
            <HelpCircle className="w-4 h-4" />
            Help Center
          </button>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        aria-label="Support options"
      >
        {isOpen ? <ChevronUp className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
