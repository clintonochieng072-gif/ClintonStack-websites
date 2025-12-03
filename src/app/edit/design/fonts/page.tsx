"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Nunito", label: "Nunito" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
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
        headers: { "Content-Type": "application/json" },
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

      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Font
          </label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            style={{ fontFamily: font }}
          >
            {fontOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                style={{ fontFamily: option.value }}
              >
                {option.label}
              </option>
            ))}
          </select>
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
