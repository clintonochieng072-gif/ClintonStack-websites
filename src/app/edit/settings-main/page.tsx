"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Search,
  Zap,
  CreditCard,
  User,
  Upload,
  Settings as SettingsIcon,
} from "lucide-react";

export default function SettingsMainPage() {
  const settingsSections = [
    {
      name: "Domain",
      href: "/edit/settings/domain",
      icon: Globe,
      description: "Custom domain settings",
      color: "text-blue-600",
    },
    {
      name: "SEO",
      href: "/edit/settings/seo",
      icon: Search,
      description: "Search optimization",
      color: "text-green-600",
    },
    {
      name: "Integrations",
      href: "/dashboard/integrations",
      icon: Zap,
      description: "Third-party integrations",
      color: "text-purple-600",
    },
    {
      name: "Billing",
      href: "/edit/settings/billing",
      icon: CreditCard,
      description: "Subscription and payments",
      color: "text-orange-600",
    },
    {
      name: "Account Settings",
      href: "/edit/settings/account",
      icon: User,
      description: "Profile and preferences",
      color: "text-gray-600",
    },
    {
      name: "Website Publish",
      href: "/edit/settings/publish",
      icon: Upload,
      description: "Publishing options",
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your domain, SEO, billing, and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.href}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <Link href={section.href}>
                  <div className="cursor-pointer">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 ${section.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <SettingsIcon className="w-4 h-4 mr-2" />
              General Settings
            </Button>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Profile Update
            </Button>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
