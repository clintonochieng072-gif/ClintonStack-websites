"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden">
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Persistent Hamburger */}
      {pathname &&
        !pathname.includes("/edit/settings/publish") &&
        !pathname.includes("/preview") && (
          <div className="fixed left-0 top-8 z-60 bg-white border-r border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 m-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

      {/* Main content */}
      <main
        className={`lg:ml-64 ${
          pathname === "/dashboard/real-estate" ? "pt-0" : "pt-16"
        } mt-0 p-4 sm:p-6 lg:p-8`}
      >
        {children}
      </main>
    </div>
  );
}
