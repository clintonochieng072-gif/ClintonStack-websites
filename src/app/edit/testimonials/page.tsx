"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import TestimonialsEditor from "@/components/TestimonialsEditor";
import { Button } from "@/components/ui/button";
import { defaultHomeContent } from "@/data/defaultHomeContent";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, {
    headers: getAuthHeaders()
  }).then((r) => r.json());

export default function TestimonialsPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const testimonialsBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "testimonials"
      );

      // If testimonials block exists, use saved data as the new baseline
      // Only fall back to static defaults for completely new sites
      if (testimonialsBlock?.data?.testimonials) {
        // Saved data becomes the new "defaults" - ensure all have IDs
        const testimonialsWithIds = testimonialsBlock.data.testimonials.map((testimonial: any, index: number) => ({
          ...testimonial,
          id: testimonial.id || `testimonial-${Date.now()}-${index}`,
        }));
        setTestimonials(testimonialsWithIds);
      } else {
        // No saved data exists, use static defaults for brand new sites - add IDs
        const testimonialsWithIds = defaultHomeContent.testimonials.testimonials.map((testimonial: any, index: number) => ({
          ...testimonial,
          id: `default-${Date.now()}-${index}`,
        }));
        setTestimonials(testimonialsWithIds);
      }
    }
  }, [siteData]);

  const handleChange = (newTestimonials: any[]) => {
    setTestimonials(newTestimonials);
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setSaving(true);
    try {
      const siteId = siteData.data._id;
      const draftData = siteData.data.userWebsite?.draft || {};

      // Find or create testimonials block
      let testimonialsBlock = draftData.blocks?.find(
        (b: any) => b.type === "testimonials"
      );
      if (!testimonialsBlock) {
        testimonialsBlock = { type: "testimonials", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(testimonialsBlock);
      }

      testimonialsBlock.data.testimonials = testimonials;

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Testimonials saved successfully!");
      } else {
        alert("Failed to save testimonials");
      }
    } catch (error) {
      alert("Error saving testimonials");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Client Testimonials
        </h2>
        <p className="text-gray-600">Add reviews from satisfied clients</p>
      </div>

      <TestimonialsEditor testimonials={testimonials} onChange={handleChange} />

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Testimonials"}
        </Button>
      </div>
    </div>
  );
}
