"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  User,
  Briefcase,
  Mail,
  Palette,
  Type,
  Layout,
  Star,
  Search,
  FileText,
  Globe,
  Plus,
  Wand2,
  Settings,
} from "lucide-react";

export default function WebsiteBuilderPage() {
  const websitePages = [
    {
      name: "Homepage",
      href: "/edit/hero",
      icon: Home,
      description: "Main landing page",
    },
    {
      name: "About",
      href: "/edit/about",
      icon: User,
      description: "About your expertise",
    },
    {
      name: "Services",
      href: "/edit/services",
      icon: Briefcase,
      description: "Your services",
    },
    {
      name: "Testimonials",
      href: "/edit/testimonials",
      icon: Star,
      description: "Client reviews",
    },
    {
      name: "Contact",
      href: "/edit/contact-page",
      icon: Mail,
      description: "Contact information",
    },
  ];

  const designSystem = [
    {
      name: "Colors",
      href: "/edit/design/colors",
      icon: Palette,
      description: "Color scheme",
    },
    {
      name: "Typography",
      href: "/edit/design/fonts",
      icon: Type,
      description: "Fonts and text styles",
    },
    {
      name: "Layout",
      href: "/edit/design/theme",
      icon: Layout,
      description: "Page layouts",
    },
    {
      name: "Branding",
      href: "/edit/design/logo",
      icon: Star,
      description: "Logo and branding",
    },
  ];

  const seoSettings = [
    {
      id: "meta-title",
      name: "Meta Title",
      href: "/edit/settings/seo",
      icon: Search,
      description: "Page titles",
    },
    {
      id: "meta-description",
      name: "Meta Description",
      href: "/edit/settings/seo",
      icon: FileText,
      description: "Page descriptions",
    },
    {
      id: "favicon",
      name: "Favicon",
      href: "/edit/settings/seo",
      icon: Globe,
      description: "Site icon",
    },
    {
      id: "footer-scripts",
      name: "Footer Scripts",
      href: "/edit/settings/seo",
      icon: FileText,
      description: "Analytics, etc.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Website Builder
        </h1>
        <p className="text-gray-600">
          Edit all your website content in one place
        </p>
      </div>

      {/* Website Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Website Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websitePages.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.href} href={page.href}>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center mb-2">
                      <Icon className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        {page.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{page.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Design System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Design System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {designSystem.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center mb-2">
                      <Icon className="w-5 h-5 mr-2 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SEO & Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            SEO & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {seoSettings.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.href}>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center mb-2">
                      <Icon className="w-5 h-5 mr-2 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Section
            </Button>
            <Button variant="outline" className="flex items-center">
              <Wand2 className="w-4 h-4 mr-2" />
              Customize Theme
            </Button>
            <Link href="/edit/settings/publish">
              <Button variant="outline" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Publish Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
