"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import SaveButton from "@/components/SaveButton";
import { defaultHomeContent } from "@/data/defaultHomeContent";
import { getAuthHeaders, apiPut } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, {
    cache: "no-store",
    headers: getAuthHeaders(),
  }).then((r) => r.json());

export default function HeroPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const heroBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "hero"
      );

      // If hero block exists, use saved data as the new baseline
      // Only fall back to static defaults for completely new sites
      if (heroBlock?.data) {
        // Saved data becomes the new "defaults" - preserve exactly what was saved
        setFormData({
          title:
            heroBlock.data.title !== undefined
              ? heroBlock.data.title
              : defaultHomeContent.hero.title,
          subtitle:
            heroBlock.data.subtitle !== undefined
              ? heroBlock.data.subtitle
              : defaultHomeContent.hero.subtitle,
          ctaText:
            heroBlock.data.ctaText !== undefined
              ? heroBlock.data.ctaText
              : defaultHomeContent.hero.ctaText,
          heroImage:
            heroBlock.data.heroImage !== undefined
              ? heroBlock.data.heroImage
              : defaultHomeContent.hero.heroImage,
        });
      } else {
        // No saved data exists, use static defaults for brand new sites
        setFormData({
          title: defaultHomeContent.hero.title,
          subtitle: defaultHomeContent.hero.subtitle,
          ctaText: defaultHomeContent.hero.ctaText,
          heroImage: defaultHomeContent.hero.heroImage,
        });
      }
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

      await apiPut(`/api/site/${siteId}`, { data: draftData });
      mutate("/api/site/me");
      alert("Hero section saved successfully!");
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
