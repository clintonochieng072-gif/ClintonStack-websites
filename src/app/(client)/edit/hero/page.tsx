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
          primaryCtaText:
            heroBlock.data.primaryCtaText !== undefined
              ? heroBlock.data.primaryCtaText
              : defaultHomeContent.hero.primaryCtaText,
          primaryCtaLink:
            heroBlock.data.primaryCtaLink !== undefined
              ? heroBlock.data.primaryCtaLink
              : defaultHomeContent.hero.primaryCtaLink,
          secondaryCtaText:
            heroBlock.data.secondaryCtaText !== undefined
              ? heroBlock.data.secondaryCtaText
              : defaultHomeContent.hero.secondaryCtaText,
          secondaryCtaLink:
            heroBlock.data.secondaryCtaLink !== undefined
              ? heroBlock.data.secondaryCtaLink
              : defaultHomeContent.hero.secondaryCtaLink,
          carouselImages:
            heroBlock.data.carouselImages !== undefined &&
            Array.isArray(heroBlock.data.carouselImages) &&
            heroBlock.data.carouselImages.length > 0
              ? heroBlock.data.carouselImages
              : defaultHomeContent.hero.carouselImages,
        });
      } else {
        // No saved data exists, use static defaults for brand new sites
        setFormData({
          title: defaultHomeContent.hero.title,
          subtitle: defaultHomeContent.hero.subtitle,
          primaryCtaText: defaultHomeContent.hero.primaryCtaText,
          primaryCtaLink: defaultHomeContent.hero.primaryCtaLink,
          secondaryCtaText: defaultHomeContent.hero.secondaryCtaText,
          secondaryCtaLink: defaultHomeContent.hero.secondaryCtaLink,
          carouselImages: defaultHomeContent.hero.carouselImages,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary CTA Text
            </label>
            <Input
              value={formData.primaryCtaText || ""}
              onChange={(e) => updateFormData("primaryCtaText", e.target.value)}
              placeholder="Primary button text (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary CTA Link
            </label>
            <Input
              value={formData.primaryCtaLink || ""}
              onChange={(e) => updateFormData("primaryCtaLink", e.target.value)}
              placeholder="#properties or external URL"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary CTA Text
            </label>
            <Input
              value={formData.secondaryCtaText || ""}
              onChange={(e) => updateFormData("secondaryCtaText", e.target.value)}
              placeholder="Secondary button text (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary CTA Link
            </label>
            <Input
              value={formData.secondaryCtaLink || ""}
              onChange={(e) => updateFormData("secondaryCtaLink", e.target.value)}
              placeholder="Link for secondary button"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Carousel Images
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload 3-5 images for the rotating hero carousel. Leave empty to use defaults.
          </p>
          {(formData.carouselImages || []).map((image: string, index: number) => (
            <div key={index} className="mb-3">
              <ImageUpload
                value={image}
                onChange={(url: string) => {
                  const newImages = [...(formData.carouselImages || [])];
                  newImages[index] = url;
                  updateFormData("carouselImages", newImages);
                }}
                placeholder={`Upload hero image ${index + 1}`}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newImages = [...(formData.carouselImages || []), ""];
              updateFormData("carouselImages", newImages);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add another image
          </button>
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
