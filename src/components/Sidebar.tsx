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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard/real-estate",
    icon: LayoutDashboard,
    description: "Quick analytics + overall status",
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

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sidebarClasses = mobile
    ? "flex flex-col h-full"
    : "fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-lg z-10";

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">ClintonStack</h1>
          {mobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isHydrated && pathname === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
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
