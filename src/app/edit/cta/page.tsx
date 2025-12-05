"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CTAPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setFormData({
        title:
          site.userWebsite?.draft?.blocks?.find((b: any) => b.type === "cta")?.data?.title || "",
        subtitle:
          site.userWebsite?.draft?.blocks?.find((b: any) => b.type === "cta")?.data?.subtitle || "",
        buttonText:
          site.userWebsite?.draft?.blocks?.find((b: any) => b.type === "cta")?.data?.buttonText ||
          "",
        buttonUrl:
          site.userWebsite?.draft?.blocks?.find((b: any) => b.type === "cta")?.data?.buttonUrl ||
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Call to Action Section
        </h2>
        <p className="text-gray-600">
          Add a compelling call-to-action to drive conversions
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
            placeholder="Ready to find your dream home?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <Textarea
            value={formData.subtitle || ""}
            onChange={(e) => updateFormData("subtitle", e.target.value)}
            placeholder="Contact me today for personalized service"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Text
          </label>
          <Input
            value={formData.buttonText || ""}
            onChange={(e) => updateFormData("buttonText", e.target.value)}
            placeholder="Get Started"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button URL
          </label>
          <Input
            value={formData.buttonUrl || ""}
            onChange={(e) => updateFormData("buttonUrl", e.target.value)}
            placeholder="https://example.com/contact"
          />
        </div>
      </div>
    </div>
  );
}
