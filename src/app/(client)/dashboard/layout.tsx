"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import FloatingButtons from "@/components/public/FloatingButtons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
      {sidebarOpen && (
        <div className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-50">
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Persistent Hamburger */}
      <div className="fixed left-0 top-16 z-60 bg-white border-r border-gray-200">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 m-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main content */}
      <main className="mt-16 p-4 sm:p-6 lg:p-8">{children}</main>

      {/* Floating support buttons - Admin only on real-estate dashboard */}
      {pathname === "/dashboard/real-estate" && (
        <FloatingButtons
          phoneNumber="+254768524480"
          whatsappNumber="+254768524480"
        />
      )}
    </div>
  );
}
