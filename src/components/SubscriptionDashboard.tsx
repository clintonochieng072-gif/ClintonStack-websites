"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HardDrive,
  Building,
  Crown,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";

interface Plan {
  _id: string;
  name: string;
  slug: string;
  price: number;
  baseStorage: number;
  maxImages: number;
  features: string[];
}

interface Subscription {
  _id: string;
  status: string;
  planId: Plan;
  extraStorageGB: number;
  usage: {
    storageUsed: number;
    imagesUsed: number;
    propertiesCount: number;
  };
  trialEndsAt?: string;
  currentPeriodEnd: string;
}

interface UsageLimits {
  storageGB: number;
  maxImages: number;
  maxProperties: number;
  canPublish: boolean;
  canUseCustomDomain: boolean;
  canUseAnalytics: boolean;
  teamAccounts: number;
}

export default function SubscriptionDashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subRes, limitsRes] = await Promise.all([
        fetch("/api/subscription"),
        fetch("/api/subscription/limits"), // We'll create this endpoint
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.data);
      }

      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        setLimits(limitsData.data);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "trial":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      case "expired":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "trial":
        return <Zap className="w-5 h-5 text-blue-600" />;
      case "cancelled":
      case "expired":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription || !limits) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load subscription data</p>
      </div>
    );
  }

  const storagePercentage =
    (subscription.usage.storageUsed / limits.storageGB) * 100;
  const imagesPercentage =
    (subscription.usage.imagesUsed / limits.maxImages) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Current Plan: {subscription.planId.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(subscription.status)}
              <span
                className={`font-medium capitalize ${getStatusColor(
                  subscription.status
                )}`}
              >
                {subscription.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {subscription.planId.price.toLocaleString()} KES
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>

          {subscription.status === "trial" && subscription.trialEndsAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Trial Period</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Your trial ends on{" "}
                {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Billing History</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.usage.storageUsed.toFixed(1)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              of {limits.storageGB} GB total
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
            {subscription.extraStorageGB > 0 && (
              <p className="text-xs text-green-600 mt-1">
                +{subscription.extraStorageGB} GB extra storage
              </p>
            )}
          </CardContent>
        </Card>

        {/* Properties Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.usage.propertiesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {limits.maxProperties === Infinity
                ? "Unlimited"
                : `of ${limits.maxProperties} allowed`}
            </p>
            {limits.maxProperties !== Infinity && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (subscription.usage.propertiesCount /
                        limits.maxProperties) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscription.planId.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {subscription.planId.slug !== "elite" && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Ready to upgrade?
                </h3>
                <p className="text-blue-700 mt-1">
                  Get more storage, features, and priority support with a higher
                  plan.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
