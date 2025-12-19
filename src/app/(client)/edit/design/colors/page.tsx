"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

const colorThemes = [
  {
    name: "Modern Blue",
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Corporate Navy",
    primary: "#1e40af",
    secondary: "#1e3a8a",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Elegant Teal",
    primary: "#0d9488",
    secondary: "#0f766e",
    accent: "#14b8a6",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Warm Orange",
    primary: "#ea580c",
    secondary: "#c2410c",
    accent: "#fb923c",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Purple Dream",
    primary: "#7c3aed",
    secondary: "#6d28d9",
    accent: "#a78bfa",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Forest Green",
    primary: "#15803d",
    secondary: "#166534",
    accent: "#22c55e",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Rose Pink",
    primary: "#be185d",
    secondary: "#9d174d",
    accent: "#f472b6",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Minimal Gray",
    primary: "#374151",
    secondary: "#1f2937",
    accent: "#6b7280",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Bright Yellow",
    primary: "#ca8a04",
    secondary: "#a16207",
    accent: "#eab308",
    background: "#ffffff",
    text: "#1f2937"
  },
  {
    name: "Ocean Blue",
    primary: "#0369a1",
    secondary: "#075985",
    accent: "#0284c7",
    background: "#ffffff",
    text: "#1f2937"
  }
];

export default function ColorsPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [customPrimary, setCustomPrimary] = useState("#3b82f6");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const currentPrimary = site.theme?.primary || "#3b82f6";
      setCustomPrimary(currentPrimary);

      // Check if it matches a predefined theme
      const matchingTheme = colorThemes.find(theme => theme.primary === currentPrimary);
      setSelectedTheme(matchingTheme ? matchingTheme.name : null);
    }
  }, [siteData]);

  const handleThemeSelect = (themeName: string) => {
    const theme = colorThemes.find(t => t.name === themeName);
    if (theme) {
      setSelectedTheme(themeName);
      setCustomPrimary(theme.primary);
    }
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setSaving(true);
    try {
      const themeToSave = selectedTheme
        ? colorThemes.find(t => t.name === selectedTheme)
        : { primary: customPrimary, secondary: "#1e40af", accent: "#60a5fa", background: "#ffffff", text: "#1f2937" };

      const response = await fetch(`/api/site/${siteData.data._id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: {
            ...siteData.data.theme,
            ...themeToSave,
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
          Choose from predefined color themes or create a custom color scheme
        </p>
      </div>

      {/* Predefined Color Themes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Color Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeSelect(theme.name)}
              className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                selectedTheme === theme.name
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <h4 className="font-medium text-gray-900">{theme.name}</h4>
              </div>
              <div className="flex space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                ></div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.secondary }}
                  title="Secondary"
                ></div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Custom Color</h3>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={customPrimary}
              onChange={(e) => {
                setCustomPrimary(e.target.value);
                setSelectedTheme(null); // Clear theme selection when custom color is used
              }}
              className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div
              className="w-full h-16 rounded-md flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: customPrimary }}
            >
              {selectedTheme ? `${selectedTheme} Theme` : "Custom Color Preview"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Colors"}
        </Button>
      </div>
    </div>
  );
}
