"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AboutPageEditor() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setFormData({
        title:
          site.blocks?.find((b: any) => b.type === "about-page")?.data?.title ||
          "",
        content:
          site.blocks?.find((b: any) => b.type === "about-page")?.data
            ?.content || "",
        image:
          site.blocks?.find((b: any) => b.type === "about-page")?.data?.image ||
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">About Page</h2>
        <p className="text-gray-600">
          Create a dedicated about page for your website
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) => updateFormData("title", e.target.value)}
            placeholder="About Me"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <Textarea
            value={formData.content || ""}
            onChange={(e) => updateFormData("content", e.target.value)}
            placeholder="Detailed information about your background and experience"
            rows={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <ImageUpload
            value={formData.image || ""}
            onChange={(url: string) => updateFormData("image", url)}
            placeholder="Upload a featured image for the about page"
          />
        </div>
      </div>
    </div>
  );
}
