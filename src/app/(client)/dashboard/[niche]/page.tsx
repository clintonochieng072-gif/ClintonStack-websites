"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  ExternalLink,
  Users,
  Mail,
  CheckCircle,
  Copy,
  Check,
  Plus,
  Phone,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";
import { useGlobalContext } from "@/context/GlobalContext";
import AdminMiniPanel from "@/components/AdminMiniPanel";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

export default function NicheDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const niche = (params as { niche: string }).niche;
  const { user } = useGlobalContext();

  const { data: siteData, error } = useSWR("/api/site/me", fetcher);
  const [site, setSite] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Only allow real-estate niche to have a dashboard
  const allowedNiches = ["real-estate"];

  useEffect(() => {
    if (siteData?.data) {
      setSite(siteData.data);
    }
  }, [siteData]);

  // Mobile loading timeout guard
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Check if user has access to this niche
  useEffect(() => {
    if (siteData?.data) {
      const currentSite = siteData.data;
      if (!currentSite || currentSite.niche !== niche) {
        // Current site is not for this niche, redirect to niches page
        router.replace("/dashboard/niches");
      }
    }
  }, [siteData, niche, router]);

  // Show "Coming Soon" for niches that don't have dashboards yet
  if (!allowedNiches.includes(niche)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {niche.charAt(0).toUpperCase() + niche.slice(1).replace("-", " ")}{" "}
              Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              This dashboard is currently under development. We're working hard
              to bring you the best experience!
            </p>
            <button
              onClick={() => router.push("/dashboard/niches")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Niches
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = async () => {
    if (!user?.has_paid) {
      alert("You need to publish the site to view this page.");
      return;
    }
    const publicURL = site ? `${window.location.origin}/site/${site.slug}` : "";
    await navigator.clipboard.writeText(publicURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!site && !forceRender) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {(user?.role === "admin" ||
        user?.email === "clintonochieng072@gmail.com") && <AdminMiniPanel />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Welcome Panel */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
          <CardContent className="p-8 pt-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to your {niche.charAt(0).toUpperCase() + niche.slice(1)}{" "}
              Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              Manage your {niche} website and track your success
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/edit")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Website
                </Button>
                <Button
                  onClick={() => router.push("/edit/properties/add")}
                  variant="default"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
                <Button
                  onClick={() => {
                    if (user?.has_paid) {
                      window.open(
                        `${window.location.origin}/site/${site.slug}`,
                        "_blank"
                      );
                    } else {
                      alert("You need to publish the site to view this page.");
                    }
                  }}
                  variant="outline"
                  disabled={!site?.published}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Site
                </Button>
              </div>

              {user?.has_paid && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Live Site Link</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 max-w-lg">
                    <Input
                      readOnly
                      value={
                        site
                          ? `${window.location.origin}/site/${site.slug}`
                          : ""
                      }
                      className="bg-gray-50 border rounded-xl"
                    />

                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex items-center gap-2 rounded-xl"
                      disabled={!user?.has_paid}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}

              {!user?.has_paid && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Live Site Link</p>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-800">
                      Publish your site to get the live link
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Visitors this month
                    </p>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Leads received
                    </p>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Website status
                    </p>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <p className="text-lg font-semibold text-green-600">
                        Online
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock data - replace with real leads */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-600">john@example.com</p>
                  <p className="text-sm text-gray-500">
                    Interested in your services
                  </p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-600">jane@example.com</p>
                  <p className="text-sm text-gray-500">
                    Great work on the website!
                  </p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
