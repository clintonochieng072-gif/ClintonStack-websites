"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Plan {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  baseStorage: number;
  maxImages: number;
  features: string[];
  extraStoragePrice: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planSlug: string) => {
    setSelectedPlan(planSlug);
    try {
      const response = await fetch("/api/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully upgraded to ${data.data.planId.name} plan!`);
        router.push("/dashboard");
      } else {
        alert(data.message || "Failed to upgrade plan");
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      alert("Failed to upgrade plan");
    } finally {
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start building your professional real estate website today. Upgrade
            or downgrade at any time.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className={`relative ${
                plan.slug === "premium"
                  ? "border-blue-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.slug === "premium" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-1">KES/month</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {plan.baseStorage}GB storage • {plan.maxImages} images/month
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.slug)}
                  disabled={selectedPlan === plan.slug}
                  className={`w-full ${
                    plan.slug === "premium"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : plan.slug === "elite"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  }`}
                  variant={plan.slug === "starter" ? "outline" : "default"}
                >
                  {selectedPlan === plan.slug ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upgrading...
                    </>
                  ) : plan.slug === "elite" ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get Lifetime Access
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>

                {plan.extraStoragePrice > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Extra storage: {plan.extraStoragePrice.toLocaleString()}{" "}
                    KES/GB
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What happens to my data?
              </h3>
              <p className="text-gray-600">
                Your website and all data remain intact when changing plans.
                Only feature access changes based on your plan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes, all plans include a 14-day free trial to test our platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept M-Pesa, card payments, and bank transfers for Kenyan
                customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
