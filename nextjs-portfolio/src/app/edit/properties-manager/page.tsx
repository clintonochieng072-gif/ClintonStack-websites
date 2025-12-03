"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Plus,
  Tag,
  Settings,
  Building,
  MapPin,
  DollarSign
} from "lucide-react";

export default function PropertiesManagerPage() {
  const propertyActions = [
    {
      name: "All Properties",
      href: "/edit/properties",
      icon: Building,
      description: "View and manage all listings",
      color: "text-blue-600"
    },
    {
      name: "Add New Property",
      href: "/edit/properties/add",
      icon: Plus,
      description: "Create a new listing",
      color: "text-green-600"
    },
    {
      name: "Categories",
      href: "/edit/properties/categories",
      icon: Tag,
      description: "Manage property categories",
      color: "text-purple-600"
    },
    {
      name: "Property Settings",
      href: "/edit/properties/settings",
      icon: Settings,
      description: "Configure property options",
      color: "text-gray-600"
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties Manager</h1>
        <p className="text-gray-600">Manage all your real estate listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {propertyActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.href} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Link href={action.href}>
                  <div className="text-center cursor-pointer">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 ${action.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}