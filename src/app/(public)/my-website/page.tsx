"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Globe,
  Edit,
  Upload,
  Plus,
  Eye,
  Users,
  DollarSign,
  Home,
  BarChart3,
  Settings,
  Search,
  Globe as GlobeIcon,
  TrendingUp,
  CheckCircle,
  Clock,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGlobal } from "@/context/GlobalContext";
import PaymentModal from "@/components/PaymentModal";
import { pusherClient } from "@/lib/pusher-client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MyWebsitePage() {
  const router = useRouter();
  const { user, authLoading } = useGlobal();
  const { data: siteData, error, mutate } = useSWR("/api/site/me", fetcher);
  const { data: leadsData } = useSWR("/api/leads", fetcher);
  const [site, setSite] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localUserHasPaid, setLocalUserHasPaid] = useState<boolean | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalLeads: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (siteData?.data) {
      setSite(siteData.data);
    }
  }, [siteData]);

  // Calculate stats
  useEffect(() => {
    if (site && leadsData?.data) {
      const propertiesBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "properties"
      );
      const totalProperties = propertiesBlock?.data?.properties?.length || 0;
      const activeListings =
        propertiesBlock?.data?.properties?.filter(
          (p: any) => p.status === "active"
        )?.length || 0;
      const totalLeads = leadsData.data.length || 0;

      // For revenue, we'll use a placeholder for now
      const revenue = 0; // TODO: Calculate from payments

      setStats({
        totalProperties,
        activeListings,
        totalLeads,
        revenue,
      });
    }
  }, [site, leadsData]);

  // Fetch fresh user data to check payment status
  const checkUserStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      console.log("MyWebsite: Fresh user data from /api/auth/me:", data);
      if (data.user) {
        const hasPaid =
          data.user.has_paid ||
          data.user.role === "admin" ||
          data.user.email === "clintonochieng072@gmail.com";
        console.log("MyWebsite: Calculated hasPaid:", hasPaid);
        setLocalUserHasPaid(hasPaid);
      } else {
        console.log("MyWebsite: No user data in response");
      }
    } catch (error) {
      console.error("MyWebsite: Error checking user status:", error);
    }
  };

  useEffect(() => {
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
          alert("Site published successfully!");
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to publish:", errorData);
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

  const handleCopyUrl = async () => {
    if (site?.slug) {
      const url = `https://${site.slug}.clintonstack.com`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        className="space-y-10"
      >
        {/* Main Action Row */}
        <Card className="shadow-lg rounded-xl border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium"
                onClick={() => router.push("/edit")}
              >
                <Edit className="w-6 h-6 mr-2" />
                Edit Website
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                onClick={() => router.push("/edit/properties")}
              >
                <Plus className="w-6 h-6 mr-2" />
                Add Property
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                asChild
              >
                <a
                  href={`https://${site?.slug}.clintonstack.com`}
                  target="_blank"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Public Site
                </a>
              </Button>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3 flex-1 min-w-0">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  https://{site?.slug}.clintonstack.com
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="ml-auto flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg rounded-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Properties
              </CardTitle>
              <Home className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalProperties}
              </div>
              <p className="text-xs text-gray-500 mt-1">Properties listed</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Listings
              </CardTitle>
              <GlobeIcon className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeListings}
              </div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Leads
              </CardTitle>
              <Users className="h-6 w-6 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalLeads}
              </div>
              <p className="text-xs text-gray-500 mt-1">Contact inquiries</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revenue
              </CardTitle>
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                KSh {stats.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card
            className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/leads")}
          >
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Manage Leads</h3>
              <p className="text-sm text-gray-600">
                View and respond to inquiries
              </p>
            </CardContent>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push("/edit")}
          >
            <CardContent className="p-6 text-center">
              <Settings className="w-10 h-10 mx-auto text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Customize Website
              </h3>
              <p className="text-sm text-gray-600">Edit design and content</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/seo")}
          >
            <CardContent className="p-6 text-center">
              <Search className="w-10 h-10 mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">SEO Settings</h3>
              <p className="text-sm text-gray-600">
                Optimize for search engines
              </p>
            </CardContent>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <CardContent className="p-6 text-center">
              <GlobeIcon className="w-10 h-10 mx-auto text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Domain Settings
              </h3>
              <p className="text-sm text-gray-600">Manage custom domain</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/analytics")}
          >
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-10 h-10 mx-auto text-red-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">View website statistics</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Graph */}
        <Card className="shadow-lg rounded-xl border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                  Traffic Growth Chart
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Analytics integration coming soon
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+24%</div>
                    <div className="text-xs text-gray-500">vs last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-xs text-gray-500">visits today</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="shadow-lg rounded-xl border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Website published successfully
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New property added: "Luxury Villa"
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <Home className="w-5 h-5 text-blue-500 flex-shrink-0" />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Lead contacted: John Smith
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <UserCheck className="w-5 h-5 text-purple-500 flex-shrink-0" />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Payment approved
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
                <CreditCard className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              </div>
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
                alert("Site published successfully!");
              } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to publish:", errorData);
                alert(
                  `Failed to publish: ${errorData.error || "Unknown error"}`
                );
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
