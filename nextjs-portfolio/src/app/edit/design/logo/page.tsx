"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LogoPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setLogo(site.logo || "");
    }
  }, [siteData]);

  const handleChange = (url: string) => {
    setLogo(url);
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/site/${siteData.data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: logo,
        }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Logo saved successfully!");
      } else {
        alert("Failed to save logo");
      }
    } catch (error) {
      console.error("Error saving logo:", error);
      alert("Failed to save logo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logo</h2>
        <p className="text-gray-600">Upload and manage your website logo</p>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo Image
        </label>
        <ImageUpload
          value={logo}
          onChange={handleChange}
          placeholder="Upload your logo image"
        />
        {logo && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={logo}
              alt="Logo"
              className="max-w-full h-auto max-h-32 object-contain"
            />
          </div>
        )}

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Logo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
