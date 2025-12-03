"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const themeOptions = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design",
    preview: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and professional",
    preview: "bg-gradient-to-br from-gray-700 to-gray-900",
  },
  {
    id: "bright",
    name: "Bright",
    description: "Vibrant and energetic",
    preview: "bg-gradient-to-br from-yellow-400 to-orange-500",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
    preview: "bg-gradient-to-br from-white to-gray-100",
  },
];

export default function ThemePage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setSelectedTheme(site.layout || "modern");
    }
  }, [siteData]);

  const handleSave = async () => {
    if (!siteData?.data) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/site/${siteData.data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layout: selectedTheme,
        }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Theme saved successfully!");
      } else {
        alert("Failed to save theme");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      alert("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Theme</h2>
        <p className="text-gray-600">
          Choose an overall theme for your website
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themeOptions.map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer transition-all ${
              selectedTheme === theme.id
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedTheme(theme.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{theme.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`w-full h-24 rounded-md mb-3 ${theme.preview}`}
              ></div>
              <p className="text-sm text-gray-600">{theme.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Selected:</strong>{" "}
          {themeOptions.find((t) => t.id === selectedTheme)?.name}
        </p>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Theme"}
        </Button>
      </div>
    </div>
  );
}
