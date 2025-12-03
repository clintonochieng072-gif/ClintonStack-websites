"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const contactSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
  email: z.string().email("Invalid email"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  additionalInfo: z.string().optional(),
});

export default function ContactPageEditor() {
  const { data: siteData, mutate } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setFormData({
        title:
          site.blocks?.find((b: any) => b.type === "contact-page")?.data
            ?.title || "",
        subtitle:
          site.blocks?.find((b: any) => b.type === "contact-page")?.data
            ?.subtitle || "",
        phone:
          site.blocks?.find((b: any) => b.type === "contact-page")?.data
            ?.phone || "",
        email:
          site.blocks?.find((b: any) => b.type === "contact-page")?.data
            ?.email || "",
        address:
          site.blocks?.find((b: any) => b.type === "contact-page")?.data
            ?.address || "",
        additionalInfo:
          site.blocks?.find((b: any) => b.type === "contact-page")?.data
            ?.additionalInfo || "",
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
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      alert("Please fill all fields correctly.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: siteData?.data?.blocks?.map((b: any) =>
            b.type === "contact-page" ? { ...b, data: formData } : b
          ),
        }),
      });

      if (res.ok) {
        setSaved(true);
        mutate();
        setTimeout(() => setSaved(false), 1500);
      } else {
        alert("Failed to save changes.");
      }
    } catch (error) {
      alert("An error occurred while saving.");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Page</h2>
        <p className="text-gray-600">
          Set up your contact page with detailed information
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title
          </label>
          <Input
            value={formData.title || ""}
            onChange={(e) => updateFormData("title", e.target.value)}
            placeholder="Contact Me"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <Textarea
            value={formData.subtitle || ""}
            onChange={(e) => updateFormData("subtitle", e.target.value)}
            placeholder="Get in touch for all your real estate needs"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <Input
            value={formData.phone || ""}
            onChange={(e) => updateFormData("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            value={formData.email || ""}
            onChange={(e) => updateFormData("email", e.target.value)}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <Textarea
            value={formData.address || ""}
            onChange={(e) => updateFormData("address", e.target.value)}
            placeholder="Your business address"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <Textarea
            value={formData.additionalInfo || ""}
            onChange={(e) => updateFormData("additionalInfo", e.target.value)}
            placeholder="Business hours, additional contact methods, etc."
            rows={4}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl mt-6"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
        </Button>
      </div>
    </div>
  );
}
