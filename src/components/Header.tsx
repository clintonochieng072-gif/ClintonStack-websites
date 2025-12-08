"use client";

import React, { useState, useEffect } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/GlobalContext";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getAuthHeaders, apiPost } from "@/lib/utils";
import PaymentModal from "@/components/PaymentModal";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

export default function Header() {
  const { user, logout } = useGlobal();
  const router = useRouter();
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [site, setSite] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      setSite(siteData.data);
    }
  }, [siteData]);

  const handlePreview = () => {
    window.open(`/preview/${site?.slug}`, "_blank");
  };

  const handlePublish = async () => {
    // Check if subscription is active
    if (user?.subscriptionStatus === "active") {
      // Publish directly
      setPublishing(true);
      try {
        await apiPost("/api/site/publish", { siteId: site?._id });
        alert("Site published successfully!");
      } catch (error: any) {
        alert(`Error publishing site: ${error.message || error}`);
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
    <header className="sticky top-0 left-64 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - can add breadcrumbs or title */}
        <div className="flex-1"></div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* HeaderActions */}
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={handlePreview}
              >
                Preview
              </Button>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-32">
                See how your website currently looks
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="default"
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Publish"}
              </Button>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-32">
                Make your latest changes live
              </span>
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>

          {/* User Avatar */}
          <Avatar>
            <AvatarImage src="" alt={user?.email || "User"} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async () => {
          setShowPaymentModal(false);
          // Publish the site after payment
          setPublishing(true);
          try {
            await apiPost("/api/site/publish", { siteId: site?._id });
            alert("Site published successfully!");
          } catch (error: any) {
            alert(`Error publishing site: ${error.message || error}`);
          } finally {
            setPublishing(false);
          }
        }}
      />
    </header>
  );
}
