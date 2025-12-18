"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/GlobalContext";
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

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => r.json());

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
  const { data: session, status } = useSession();
  const { data: sitesData, error } = useSWR("/api/site/me?all=true", fetcher);
  const [userSites, setUserSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSite, setCreatingSite] = useState<string | null>(null);
  const { refreshUser } = useGlobalContext();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (sitesData && status === "authenticated") {
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
  }, [sitesData, error, status, router]);

  const handleNicheSelect = async (nicheId: string) => {
    if (!session) {
      console.error("No session available");
      return;
    }

    const existingSite = userSites.find((site) => site.niche === nicheId);

    if (existingSite) {
      // Site exists, redirect to dashboard
      router.push(`/dashboard/${nicheId}`);
    } else {
      // Create new site
      setCreatingSite(nicheId);
      try {
        const response = await fetch("/api/site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ niche: nicheId }),
        });

        if (response.ok) {
          const newSite = await response.json();
          await refreshUser();
          router.push(`/dashboard/${nicheId}`);
        } else {
          const errorText = await response.text();
          console.error("Failed to create site:", response.status, errorText);
        }
      } catch (error) {
        console.error("Error creating site:", error);
      } finally {
        setCreatingSite(null);
      }
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === "loading"
              ? "Authenticating..."
              : "Loading your sites..."}
          </p>
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
                      disabled={creatingSite === niche.id}
                    >
                      {creatingSite === niche.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Creating...
                        </>
                      ) : hasSite ? (
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
