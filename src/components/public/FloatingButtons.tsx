"use client";

import React from "react";
import { Phone } from "lucide-react";

interface FloatingButtonsProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

export default function FloatingButtons({
  phoneNumber,
  whatsappNumber,
}: FloatingButtonsProps) {
  // Use admin phone number for contacting admin
  const adminPhoneNumber = "+254768524480";

  const handlePhoneClick = () => {
    window.location.href = `tel:${adminPhoneNumber}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Contact Button */}
      <button
        onClick={handlePhoneClick}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        aria-label="Contact admin"
        title="Contact admin"
      >
        <Phone className="w-6 h-6" />
      </button>
    </div>
  );
}
