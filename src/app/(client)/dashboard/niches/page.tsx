"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Car,
  Wrench,
  Briefcase,
  Camera,
  Heart,
  Building,
  Users,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

const niches = [
  {
    id: "real-estate",
    name: "Real Estate",
    description:
      "Create stunning property listings and showcase homes for sale",
    icon: Home,
    color: "bg-blue-50 hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "car-dealer",
    name: "Car Dealer",
    description:
      "Build an impressive car dealership website with inventory management",
    icon: Car,
    color: "bg-green-50 hover:bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "plumber",
    name: "Plumber",
    description: "Professional plumbing services website with service areas",
    icon: Wrench,
    color: "bg-orange-50 hover:bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "business",
    name: "Business",
    description: "Corporate website for companies and enterprises",
    icon: Briefcase,
    color: "bg-purple-50 hover:bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "photographer",
    name: "Photographer",
    description: "Portfolio website to showcase your photography work",
    icon: Camera,
    color: "bg-pink-50 hover:bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    id: "beauty",
    name: "Beauty Salon",
    description: "Elegant website for beauty and wellness services",
    icon: Heart,
    color: "bg-red-50 hover:bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "consultant",
    name: "Consultant",
    description: "Professional consulting services website",
    icon: Users,
    color: "bg-indigo-50 hover:bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Food service website with menu and reservations",
    icon: Building,
    color: "bg-yellow-50 hover:bg-yellow-100",
    iconColor: "text-yellow-600",
  },
];

export default function NichesPage() {
  const router = useRouter();
  const { data: sitesData, error } = useSWR("/api/site/me?all=true", fetcher);
  const [userSites, setUserSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<string>("");

  useEffect(() => {
    if (sitesData) {
      const sites = sitesData.data || [];
      setUserSites(sites);

      // Auto-redirect logic
      if (sites.length === 1) {
        // If user has exactly one site, redirect to its dashboard
        router.replace(`/dashboard/${sites[0].niche}`);
      } else if (sites.length > 1) {
        // If user has multiple sites, stay on niches page
        setLoading(false);
      } else {
        // If user has no sites, stay on niches page
        setLoading(false);
      }
    } else if (error) {
      setLoading(false);
    }
  }, [sitesData, error, router]);

  const handleNicheSelect = async (nicheId: string) => {
    const existingSite = userSites.find((site) => site.niche === nicheId);

    if (existingSite) {
      // Site exists, redirect to dashboard
      router.push(`/dashboard/${nicheId}`);
    } else {
      // Create new site
      try {
        const response = await fetch("/api/site", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ niche: nicheId }),
        });

        if (response.ok) {
          const newSite = await response.json();

          // Show success message
          setSelectedNiche(nicheId);
          setShowSuccess(true);

          // Redirect after showing success message
          setTimeout(() => {
            router.push(`/dashboard/${nicheId}`);
          }, 2000); // 2 second delay to show the message
        } else {
          const errorText = await response.text();
          console.error("Failed to create site:", response.status, errorText);
        }
      } catch (error) {
        console.error("Error creating site:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Niche
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the type of business website you want to create. You can
            create multiple sites for different niches.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {niches.map((niche, index) => {
            const Icon = niche.icon;
            const existingSite = userSites.find(
              (site) => site.niche === niche.id
            );
            const hasSite = !!existingSite;

            return (
              <motion.div
                key={niche.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card
                  className={`${niche.color} border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                  onClick={() => handleNicheSelect(niche.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                        <Icon className={`w-6 h-6 ${niche.iconColor}`} />
                      </div>
                      {hasSite && (
                        <div className="flex items-center text-green-600">
                          <Star className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl">{niche.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {niche.description}
                    </p>
                    <Button
                      className="w-full group-hover:bg-opacity-90 transition-colors"
                      variant={hasSite ? "outline" : "default"}
                    >
                      {hasSite ? (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Website
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Success Message Overlay */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Website Created Successfully! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Your {niches.find(n => n.id === selectedNiche)?.name} website has been created and is ready to customize.
              </p>
              <div className="flex items-center justify-center text-blue-600">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Redirecting to dashboard...
              </div>
            </motion.div>
          </motion.div>
        )}

        {userSites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Active Sites
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                You have {userSites.length} active website
                {userSites.length > 1 ? "s" : ""}. Click on any niche above to
                continue working on it.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
