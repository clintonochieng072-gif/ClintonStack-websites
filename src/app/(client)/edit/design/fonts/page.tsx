"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

const fontOptions = [
  // Sans Serif Fonts
  { value: "Inter", label: "Inter", category: "Sans Serif" },
  { value: "Roboto", label: "Roboto", category: "Sans Serif" },
  { value: "Open Sans", label: "Open Sans", category: "Sans Serif" },
  { value: "Lato", label: "Lato", category: "Sans Serif" },
  { value: "Poppins", label: "Poppins", category: "Sans Serif" },
  { value: "Montserrat", label: "Montserrat", category: "Sans Serif" },
  { value: "Nunito", label: "Nunito", category: "Sans Serif" },
  { value: "Source Sans Pro", label: "Source Sans Pro", category: "Sans Serif" },
  { value: "DM Sans", label: "DM Sans", category: "Sans Serif" },
  { value: "Work Sans", label: "Work Sans", category: "Sans Serif" },
  { value: "Fira Sans", label: "Fira Sans", category: "Sans Serif" },
  { value: "Barlow", label: "Barlow", category: "Sans Serif" },
  { value: "Karla", label: "Karla", category: "Sans Serif" },
  { value: "Rubik", label: "Rubik", category: "Sans Serif" },
  { value: "Mulish", label: "Mulish", category: "Sans Serif" },
  { value: "Quicksand", label: "Quicksand", category: "Sans Serif" },

  // Serif Fonts
  { value: "Playfair Display", label: "Playfair Display", category: "Serif" },
  { value: "Merriweather", label: "Merriweather", category: "Serif" },
  { value: "Crimson Text", label: "Crimson Text", category: "Serif" },
  { value: "Lora", label: "Lora", category: "Serif" },
  { value: "Source Serif Pro", label: "Source Serif Pro", category: "Serif" },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "Serif" },
  { value: "Crimson Pro", label: "Crimson Pro", category: "Serif" },
  { value: "Vollkorn", label: "Vollkorn", category: "Serif" },

  // Display/Creative Fonts
  { value: "Oswald", label: "Oswald", category: "Display" },
  { value: "Bebas Neue", label: "Bebas Neue", category: "Display" },
  { value: "Raleway", label: "Raleway", category: "Display" },
  { value: "Comfortaa", label: "Comfortaa", category: "Display" },
  { value: "Righteous", label: "Righteous", category: "Display" },
  { value: "Fredoka One", label: "Fredoka One", category: "Display" },
  { value: "Bungee", label: "Bungee", category: "Display" },
  { value: "Chewy", label: "Chewy", category: "Display" },
];

export default function FontsPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [font, setFont] = useState("Inter");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setFont(site.theme?.font || "Inter");
    }
  }, [siteData]);

  const handleSave = async () => {
    if (!siteData?.data) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/site/${siteData.data._id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: {
            ...siteData.data.theme,
            font: font,
          },
        }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Fonts saved successfully!");
      } else {
        alert("Failed to save fonts");
      }
    } catch (error) {
      console.error("Error saving fonts:", error);
      alert("Failed to save fonts");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fonts</h2>
        <p className="text-gray-600">Choose the typography for your website</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Primary Font
          </label>

          {/* Font Categories */}
          {["Sans Serif", "Serif", "Display"].map((category) => {
            const categoryFonts = fontOptions.filter(f => f.category === category);
            return (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryFonts.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFont(option.value)}
                      className={`p-3 border rounded-lg text-left transition-all hover:shadow-md ${
                        font === option.value
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ fontFamily: option.value }}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Aa Bb Cc
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div style={{ fontFamily: font }}>
            <h3 className="text-lg font-bold">Heading Example</h3>
            <p className="text-base">
              This is how your text will look with the selected font. The quick
              brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Fonts"}
          </Button>
        </div>
      </div>
    </div>
  );
}
