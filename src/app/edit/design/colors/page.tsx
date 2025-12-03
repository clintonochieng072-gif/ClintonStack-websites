"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ColorsPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setPrimaryColor(site.theme?.primary || "#3b82f6");
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
          theme: {
            ...siteData.data.theme,
            primary: primaryColor,
          },
        }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Colors saved successfully!");
      } else {
        alert("Failed to save colors");
      }
    } catch (error) {
      console.error("Error saving colors:", error);
      alert("Failed to save colors");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Colors</h2>
        <p className="text-gray-600">
          Customize the color scheme of your website
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div
            className="w-full h-16 rounded-md flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Primary Color Preview
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Colors"}
          </Button>
        </div>
      </div>
    </div>
  );
}
