"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Home,
  Image,
  Settings,
  BarChart3,
  Users,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Quick analytics + overall status",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Detailed website analytics",
  },
  {
    name: "CRM",
    href: "/dashboard/leads",
    icon: Users,
    description: "Manage leads and customers",
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: UserCog,
    description: "Manage team members",
  },
  {
    name: "Properties Manager",
    href: "/edit/properties-manager",
    icon: Home,
    description: "Manage real estate listings",
  },
  {
    name: "Website Builder",
    href: "/edit",
    icon: Globe,
    description: "Edit all website content",
  },
  {
    name: "Media Library",
    href: "/edit/media-library",
    icon: Image,
    description: "All images and media",
  },
  {
    name: "Settings",
    href: "/edit/settings-main",
    icon: Settings,
    description: "Domain, SEO, billing, account",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ClintonStack</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isHydrated && pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-lg",
                      isActive && "bg-blue-50 border-r-2 border-blue-500"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">© 2024 ClintonStack</p>
        </div>
      </div>
    </div>
  );
}
