"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Search,
  Menu,
  User,
  Settings,
  LineChart,
  Globe,
  Users,
  LayoutDashboard,
  Shield,
  FileText,
  BarChart3,
  X,
  CreditCard,
  UserCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarMenuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    name: "All Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage all users",
  },
  {
    name: "All Affiliates",
    href: "/admin/affiliates",
    icon: UserCheck,
    description: "Manage all affiliates",
  },
  {
    name: "All Clients",
    href: "/admin/clients",
    icon: Users,
    description: "Manage all clients",
  },
  {
    name: "Pending Withdrawals",
    href: "/admin/withdrawals",
    icon: CreditCard,
    description: "Approve affiliate withdrawals",
  },
  {
    name: "Pending Payments",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Approve manual payments",
  },

  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
    description: "Action logs & history",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Platform statistics",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Admin configuration",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element;
        if (!target.closest(".user-menu")) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/auth/login" });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: redirect to login
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] grid grid-cols-1 lg:grid-cols-[250px_1fr]">
      {/* -------------------------------------- */}
      {/* SIDEBAR */}
      {/* -------------------------------------- */}
      <aside className="hidden lg:block bg-white border-r border-gray-200 z-20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
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
            <p className="text-xs text-gray-500">© 2024 ClintonStack Admin</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden">
          <div className="flex flex-col h-full">
            {/* Close button */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {sidebarMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                    >
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
              <p className="text-xs text-gray-500">© 2024 ClintonStack Admin</p>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col min-h-screen z-10 transition-transform duration-300",
          sidebarOpen && "lg:translate-x-0 translate-x-64"
        )}
      >
        {/* -------------------------------------- */}
        {/* TOP NAVBAR */}
        {/* -------------------------------------- */}
        <header className="sticky top-0 z-30 w-full bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={22} />
              </button>
              <h1 className="text-2xl font-semibold tracking-tight">
                ClintonStack Admin
              </h1>
            </div>

            <div className="hidden md:flex items-center flex-1 mx-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Admin search");
                }}
                className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-2"
              >
                <Search className="text-gray-500" size={18} />
                <input
                  placeholder="Search users, sites, templates..."
                  className="bg-transparent w-full outline-none ml-2"
                />
              </form>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 rounded-full overflow-hidden border shadow-sm w-9 h-9 flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <User size={20} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
