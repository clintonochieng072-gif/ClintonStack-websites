"use client";

import React, { useState, useEffect } from "react";
import { Bell, User, LogOut, Menu, Settings, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGlobal } from "@/context/GlobalContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getAuthHeaders, apiPost } from "@/lib/utils";
import ManualPaymentModal from "@/components/ManualPaymentModal";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useGlobal();
  const { status } = useSession();
  const router = useRouter();
  const { data: siteData } = useSWR(user ? "/api/site/me" : null, fetcher);
  const { data: notificationsData, mutate: mutateNotifications } = useSWR(
    status === "authenticated" ? "/api/notifications" : null,
    fetcher
  );

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      mutateNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  const [site, setSite] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localUserHasPaid, setLocalUserHasPaid] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (siteData?.data) {
      setSite(siteData.data);
    }
  }, [siteData]);

  // Use user data from context to check payment status
  useEffect(() => {
    if (user) {
      const hasPaid =
        user.has_paid ||
        user.role === "admin" ||
        user.email === "clintonochieng072@gmail.com";
      setLocalUserHasPaid(hasPaid);
    } else {
      setLocalUserHasPaid(null);
    }
  }, [user]);

  const handlePreview = () => {
    if (site?.slug) {
      window.open(`/preview/${site.slug}`, "_blank");
    }
  };

  const userHasPaid =
    localUserHasPaid !== null
      ? localUserHasPaid
      : user
      ? user.has_paid ||
        user.role === "admin" ||
        user.email === "clintonochieng072@gmail.com"
      : false;

  // User status is managed by GlobalContext

  const handlePublish = async () => {
    if (!site) {
      console.error("No site data available");
      return;
    }

    if (userHasPaid) {
      // Publish directly
      setPublishing(true);
      try {
        const response = await fetch("/api/site/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId: site._id }),
        });
        if (response.ok) {
          alert("Site published successfully!");
          // Refresh the page to show updated status
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert(`Failed to publish: ${errorData.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error publishing:", error);
      } finally {
        setPublishing(false);
      }
    } else {
      // Show payment modal
      setShowPaymentModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 lg:left-64 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 mr-4"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Left side - can add breadcrumbs or title */}
        <div className="flex-1"></div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* HeaderActions */}
          <div className="hidden sm:flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                className="px-8 py-4 text-lg font-medium hover:bg-gray-50 border-2"
                onClick={handlePreview}
                disabled={!site}
              >
                Preview
              </Button>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-24">
                See how your website looks
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="default"
                className="px-8 py-4 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                onClick={handlePublish}
                disabled={publishing || !site}
              >
                {publishing ? "Publishing..." : "Publish"}
              </Button>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-24">
                Make changes live
              </span>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Notifications"
                className="hover:bg-gray-100"
              >
                <Bell className="w-7 h-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-sm text-gray-600">
                  {notificationsData?.unreadCount > 0
                    ? `You have ${
                        notificationsData.unreadCount
                      } unread notification${
                        notificationsData.unreadCount > 1 ? "s" : ""
                      }`
                    : "No new notifications"}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificationsData?.notifications?.length > 0 ? (
                  notificationsData.notifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification._id}
                      className="p-4"
                      onClick={() =>
                        !notification.read && markAsRead(notification._id)
                      }
                    >
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex items-start justify-between">
                          <p
                            className={`text-sm font-medium ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <>
                    <DropdownMenuItem className="p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          Welcome to your dashboard!
                        </p>
                        <p className="text-xs text-gray-500">
                          Get started by exploring your website
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          Site published successfully
                        </p>
                        <p className="text-xs text-gray-500">
                          Your changes are now live
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="User Menu"
                className="hover:bg-gray-100"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback>
                    <User className="w-7 h-7" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/affiliate/profile")}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/billing")}>
                <Settings className="w-4 h-4 mr-2" />
                Billing / Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Manual Payment Modal */}
      <ManualPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          // Note: Publishing will happen after admin approval
        }}
      />
    </header>
  );
}
