"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Link as LinkIcon,
  Users,
  Wallet,
  User,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const affiliateMenuItems = [
  {
    name: "Overview",
    href: "/dashboard/affiliate",
    icon: LayoutDashboard,
    description: "Dashboard & stats",
  },
  {
    name: "Products",
    href: "/dashboard/affiliate/products",
    icon: Package,
    description: "Products to promote",
  },
  {
    name: "Referral Link",
    href: "/dashboard/affiliate/referral",
    icon: LinkIcon,
    description: "Your referral link",
  },
  {
    name: "Referrals",
    href: "/dashboard/affiliate/referrals",
    icon: Users,
    description: "Referral management",
  },
  {
    name: "Withdraw",
    href: "/dashboard/affiliate/withdraw",
    icon: Wallet,
    description: "Withdraw funds",
  },
  {
    name: "Profile",
    href: "/dashboard/affiliate/profile",
    icon: User,
    description: "Account settings",
  },
  {
    name: "Logout",
    href: "#",
    icon: LogOut,
    description: "Sign out",
    action: "logout",
  },
];

interface AffiliateSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function AffiliateSidebar({
  mobile = false,
  onClose,
}: AffiliateSidebarProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sidebarClasses = mobile
    ? "flex flex-col h-full bg-white"
    : "fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-lg z-10";

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">
            ClintonStack
            <br />
            <span className="text-sm font-normal text-gray-600">
              Affiliate Program
            </span>
          </h1>
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
            {affiliateMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                isHydrated &&
                pathname === item.href &&
                item.action !== "logout";

              if (item.action === "logout") {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      // Handle logout
                      localStorage.removeItem("auth_token");
                      window.location.href = "/auth/login";
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center rounded-lg text-left"
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
                  </button>
                );
              }

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
          <p className="text-xs text-gray-500">© 2024 ClintonStack Affiliate</p>
        </div>
      </div>
    </div>
  );
}
