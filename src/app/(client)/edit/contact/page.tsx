"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SaveButton from "@/components/SaveButton";
import { defaultHomeContent } from "@/data/defaultHomeContent";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, {
    cache: "no-store",
    headers: getAuthHeaders()
  }).then((r) => r.json());

export default function ContactPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const contactBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "contact"
      );

      // If contact block exists, use saved data as the new baseline
      // Only fall back to static defaults for completely new sites
      if (contactBlock?.data) {
        // Saved data becomes the new "defaults" - preserve exactly what was saved
        setFormData({
          email:
            contactBlock.data.email !== undefined
              ? contactBlock.data.email
              : defaultHomeContent.contact.email,
          phone:
            contactBlock.data.phone !== undefined
              ? contactBlock.data.phone
              : defaultHomeContent.contact.phone,
          address:
            contactBlock.data.address !== undefined
              ? contactBlock.data.address
              : defaultHomeContent.contact.address,
        });
      } else {
        // No saved data exists, use static defaults for brand new sites
        setFormData({
          email: defaultHomeContent.contact.email,
          phone: defaultHomeContent.contact.phone,
          address: defaultHomeContent.contact.address,
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

      // Find or create contact block
      let contactBlock = draftData.blocks?.find(
        (b: any) => b.type === "contact"
      );
      if (!contactBlock) {
        contactBlock = { type: "contact", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(contactBlock);
      }

      contactBlock.data = { ...contactBlock.data, ...formData };

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Contact section saved successfully!");
      } else {
        alert("Failed to save contact section");
      }
    } catch (error) {
      alert("Error saving contact section");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Contact Section
        </h2>
        <p className="text-gray-600">
          Edit your contact information displayed on the homepage
        </p>
      </div>

      <div className="space-y-6">
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
            Phone
          </label>
          <Input
            value={formData.phone || ""}
            onChange={(e) => updateFormData("phone", e.target.value)}
            placeholder="+254 700 123 456"
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
      </div>

      <div className="flex justify-end pt-6 border-t">
        <SaveButton
          onClick={handleSave}
          loading={isSaving}
          text="Save Contact"
          loadingText="Saving Contact..."
        />
      </div>
    </div>
  );
}
