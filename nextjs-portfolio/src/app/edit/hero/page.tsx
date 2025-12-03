"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import SaveButton from "@/components/SaveButton";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function HeroPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setFormData({
        title:
          site.blocks?.find((b: any) => b.type === "hero")?.data?.title || "",
        subtitle:
          site.blocks?.find((b: any) => b.type === "hero")?.data?.subtitle ||
          "",
        ctaText:
          site.blocks?.find((b: any) => b.type === "hero")?.data?.ctaText || "",
        heroImage:
          site.blocks?.find((b: any) => b.type === "hero")?.data?.heroImage ||
          "",
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

      // Find or create hero block
      let heroBlock = draftData.blocks?.find((b: any) => b.type === "hero");
      if (!heroBlock) {
        heroBlock = { type: "hero", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(heroBlock);
      }

      heroBlock.data = { ...heroBlock.data, ...formData };

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Hero section saved successfully!");
      } else {
        alert("Failed to save hero section");
      }
    } catch (error) {
      alert("Error saving hero section");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hero Section</h2>
        <p className="text-gray-600">
          Edit your main headline, subtitle, and call-to-action
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <Input
            value={formData.title || ""}
            onChange={(e) => updateFormData("title", e.target.value)}
            placeholder="Enter your main headline"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <Textarea
            value={formData.subtitle || ""}
            onChange={(e) => updateFormData("subtitle", e.target.value)}
            placeholder="Enter a compelling subtitle"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTA Text
          </label>
          <Input
            value={formData.ctaText || ""}
            onChange={(e) => updateFormData("ctaText", e.target.value)}
            placeholder="Call to action button text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image
          </label>
          <ImageUpload
            value={formData.heroImage || ""}
            onChange={(url: string) => updateFormData("heroImage", url)}
            placeholder="Upload hero background image"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <SaveButton
          onClick={handleSave}
          loading={isSaving}
          text="Save Hero"
          loadingText="Saving Hero..."
        />
      </div>
    </div>
  );
}
