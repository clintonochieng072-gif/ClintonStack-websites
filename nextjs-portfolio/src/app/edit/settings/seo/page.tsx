"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SEOSettingsPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  });

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setSeoData({
        title: site.seo?.title || site.title || "",
        description: site.seo?.description || "",
        keywords: site.seo?.keywords || "",
        ogImage: site.seo?.ogImage || "",
      });
    }
  }, [siteData]);

  const updateSeoData = (field: string, value: string) => {
    setSeoData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO Settings</h2>
        <p className="text-gray-600">
          Optimize your website for search engines
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meta Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <Input
              value={seoData.title}
              onChange={(e) => updateSeoData("title", e.target.value)}
              placeholder="Your website title"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {seoData.title.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <Textarea
              value={seoData.description}
              onChange={(e) => updateSeoData("description", e.target.value)}
              placeholder="Brief description of your website"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {seoData.description.length}/160 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <Input
              value={seoData.keywords}
              onChange={(e) => updateSeoData("keywords", e.target.value)}
              placeholder="real estate, property, homes"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate keywords with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open Graph Image URL
            </label>
            <Input
              value={seoData.ogImage}
              onChange={(e) => updateSeoData("ogImage", e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Image for social media sharing (1200x630 recommended)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
