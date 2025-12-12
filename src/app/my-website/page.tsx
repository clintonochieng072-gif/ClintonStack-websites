"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Edit, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobal } from "@/context/GlobalContext";
import PaymentModal from "@/components/PaymentModal";
import { pusherClient } from "@/lib/pusher-client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MyWebsitePage() {
  const router = useRouter();
  const { user, authLoading } = useGlobal();
  const { data: siteData, error, mutate } = useSWR("/api/site/me", fetcher);
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

  // Fetch fresh user data to check payment status
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        console.log("Fresh user data from /api/auth/me:", data);
        if (data.user) {
          const hasPaid =
            data.user.has_paid ||
            data.user.role === "admin" ||
            data.user.email === "clintonochieng072@gmail.com";
          console.log("Calculated hasPaid:", hasPaid);
          setLocalUserHasPaid(hasPaid);
        } else {
          console.log("No user data in response");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    if (!authLoading && user) {
      checkUserStatus();

      // Listen for payment approval events
      const channel = pusherClient.subscribe(`user-${user.id}`);
      channel.bind("payment-approved", () => {
        console.log("Payment approved event received, refreshing user status");
        checkUserStatus();
      });

      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(`user-${user.id}`);
      };
    }
  }, [authLoading, user]);

  const userHasPaid =
    localUserHasPaid !== null
      ? localUserHasPaid
      : user
      ? user.has_paid ||
        user.role === "admin" ||
        user.email === "clintonochieng072@gmail.com"
      : false;

  const handlePublish = async () => {
    if (userHasPaid) {
      // Publish directly
      setPublishing(true);
      try {
        const response = await fetch("/api/site/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ siteId: site._id }),
        });
        if (response.ok) {
          mutate(); // Refresh the site data
        } else {
          console.error("Failed to publish");
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Site
            </h1>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!site) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Loading...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Website</h1>
        </div>

        {/* Website Overview Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              My Website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Site Name</p>
                <p className="text-lg font-semibold">
                  {site.title || "Untitled"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Subdomain</p>
                <p className="text-lg font-semibold">
                  {site.slug}.clintonstack.com
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Domain Status
                </p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p
                  className={`text-lg font-semibold ${
                    site.published ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {site.published ? "Published" : "Draft"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/edit")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Website
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/site/${site.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Website
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePublish}
                disabled={publishing || site.published}
              >
                <Upload className="w-4 h-4 mr-2" />
                {publishing
                  ? "Publishing..."
                  : site.published
                  ? "Published"
                  : "Publish Website"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={async () => {
            setShowPaymentModal(false);
            // Publish the site after payment
            setPublishing(true);
            try {
              const response = await fetch("/api/site/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ siteId: site._id }),
              });
              if (response.ok) {
                mutate(); // Refresh the site data
              } else {
                console.error("Failed to publish");
              }
            } catch (error) {
              console.error("Error publishing:", error);
            } finally {
              setPublishing(false);
            }
          }}
        />
      </motion.div>
    </DashboardLayout>
  );
}
