"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import SaveButton from "@/components/SaveButton";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function AboutPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setFormData({
        bio: site.blocks?.find((b: any) => b.type === "about")?.data?.bio || "",
        profilePhoto:
          site.blocks?.find((b: any) => b.type === "about")?.data
            ?.profilePhoto || "",
      });
    }
  }, [siteData]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setIsSaving(true);
    try {
      const siteId = siteData.data._id;
      const draftData = siteData.data.userWebsite?.draft || {};

      // Find or create about block
      let aboutBlock = draftData.blocks?.find((b: any) => b.type === "about");
      if (!aboutBlock) {
        aboutBlock = { type: "about", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(aboutBlock);
      }

      aboutBlock.data = { ...aboutBlock.data, ...formData };

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("About section saved successfully!");
      } else {
        alert("Failed to save about section");
      }
    } catch (error) {
      alert("Error saving about section");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">About Section</h2>
        <p className="text-gray-600">
          Tell visitors about your real estate expertise
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <Textarea
            value={formData.bio || ""}
            onChange={(e) => updateFormData("bio", e.target.value)}
            placeholder="Tell visitors about yourself"
            rows={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <ImageUpload
            value={formData.profilePhoto || ""}
            onChange={(url: string) => updateFormData("profilePhoto", url)}
            placeholder="Upload profile photo"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <SaveButton
          onClick={handleSave}
          loading={isSaving}
          text="Save About"
          loadingText="Saving About..."
        />
      </div>
    </div>
  );
}
