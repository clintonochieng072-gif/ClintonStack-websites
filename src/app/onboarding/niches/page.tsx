"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";

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

export default function OnboardingNichesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNicheSelect = async (nicheId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/site", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ niche: nicheId }),
      });

      if (response.ok) {
        router.push(`/dashboard/${nicheId}`);
      } else {
        console.error("Failed to create site");
      }
    } catch (error) {
      console.error("Error creating site:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome! Let's get started
          </h1>
          <p className="text-xl text-gray-600">
            Choose the type of business website you want to create
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {niches.map((niche, index) => {
            const Icon = niche.icon;

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
                    <div className="p-3 rounded-lg bg-white shadow-sm">
                      <Icon className={`w-6 h-6 ${niche.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{niche.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {niche.description}
                    </p>
                    <Button
                      className="w-full group-hover:bg-opacity-90 transition-colors"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Get Started"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
