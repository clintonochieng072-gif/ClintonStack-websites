"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import ServicesEditor from "@/components/ServicesEditor";
import SaveButton from "@/components/SaveButton";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function ServicesPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [services, setServices] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setServices(
        site.blocks?.find((b: any) => b.type === "services")?.data?.services ||
          []
      );
    }
  }, [siteData]);

  const handleChange = (newServices: any[]) => {
    setServices(newServices);
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setIsSaving(true);
    try {
      const siteId = siteData.data._id;
      const draftData = siteData.data.userWebsite?.draft || {};

      // Find or create services block
      let servicesBlock = draftData.blocks?.find(
        (b: any) => b.type === "services"
      );
      if (!servicesBlock) {
        servicesBlock = { type: "services", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(servicesBlock);
      }

      servicesBlock.data.services = services;

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Services saved successfully!");
      } else {
        alert("Failed to save services");
      }
    } catch (error) {
      alert("Error saving services");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Services</h2>
        <p className="text-gray-600">
          List your real estate services and offerings
        </p>
      </div>

      <ServicesEditor services={services} onChange={handleChange} />

      <div className="flex justify-end pt-6 border-t">
        <SaveButton
          onClick={handleSave}
          loading={isSaving}
          text="Save Services"
          loadingText="Saving Services..."
        />
      </div>
    </div>
  );
}
