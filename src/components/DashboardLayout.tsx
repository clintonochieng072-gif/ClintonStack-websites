"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import FloatingButtons from "./public/FloatingButtons";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden">
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content */}
      <main className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">{children}</main>

      {/* Floating support buttons */}
      <FloatingButtons
        phoneNumber="+254768524480"
        whatsappNumber="+254768524480"
      />
    </div>
  );
}
