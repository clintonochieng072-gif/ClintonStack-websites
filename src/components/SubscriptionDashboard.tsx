"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  CreditCard,
} from "lucide-react";

interface UserSubscription {
  subscriptionStatus: "active" | "inactive";
  subscriptionType: "monthly" | "lifetime" | null;
  subscriptionExpiresAt: Date | null;
  mpesaNumber?: string;
}

export default function SubscriptionDashboard() {
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserSubscription({
            subscriptionStatus: data.user.subscriptionStatus || "inactive",
            subscriptionType: data.user.subscriptionType || null,
            subscriptionExpiresAt: data.user.subscriptionExpiresAt
              ? new Date(data.user.subscriptionExpiresAt)
              : null,
            mpesaNumber: data.user.mpesaNumber,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "inactive":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPlanName = (type: string | null) => {
    switch (type) {
      case "monthly":
        return "Monthly Subscription";
      case "lifetime":
        return "Lifetime Access";
      default:
        return "No Active Plan";
    }
  };

  const getPlanPrice = (type: string | null) => {
    switch (type) {
      case "monthly":
        return "999 KES/month";
      case "lifetime":
        return "5 KES (one-time)";
      default:
        return "Free";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userSubscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load subscription data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Current Plan: {getPlanName(userSubscription.subscriptionType)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(userSubscription.subscriptionStatus)}
              <span
                className={`font-medium capitalize ${getStatusColor(
                  userSubscription.subscriptionStatus
                )}`}
              >
                {userSubscription.subscriptionStatus}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {getPlanPrice(userSubscription.subscriptionType)}
              </div>
            </div>
          </div>

          {/* Expiration Info */}
          {userSubscription.subscriptionType === "monthly" &&
            userSubscription.subscriptionExpiresAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Next Billing Date</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  {userSubscription.subscriptionExpiresAt.toLocaleDateString()}
                </p>
              </div>
            )}

          {/* Inactive Warning */}
          {userSubscription.subscriptionStatus === "inactive" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Subscription Required</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                You need an active subscription to publish your website.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/billing")}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      {userSubscription.subscriptionType && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Access to all website templates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Unlimited website creation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Full customization options</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Custom domain support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">SEO optimization tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Analytics integration</span>
              </div>
              {userSubscription.subscriptionType === "lifetime" && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      Lifetime access - no recurring payments
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Priority onboarding support</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      {userSubscription.subscriptionStatus === "inactive" && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Unlock Website Publishing
                </h3>
                <p className="text-blue-700 mt-1">
                  Choose a subscription plan to publish your website and access
                  all premium features.
                </p>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => (window.location.href = "/billing")}
              >
                Choose Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
