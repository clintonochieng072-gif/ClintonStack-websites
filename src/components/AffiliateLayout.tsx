"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import AffiliateSidebar from "./AffiliateSidebar";
import Header from "./Header";
import FloatingButtons from "./public/FloatingButtons";

interface AffiliateLayoutProps {
  children: React.ReactNode;
}

export default function AffiliateLayout({ children }: AffiliateLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="hidden lg:block">
        <AffiliateSidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden">
          <AffiliateSidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">{children}</main>

      {/* Floating support buttons */}
      <FloatingButtons
        phoneNumber="+254768524480"
        whatsappNumber="+254768524480"
      />
    </div>
  );
}