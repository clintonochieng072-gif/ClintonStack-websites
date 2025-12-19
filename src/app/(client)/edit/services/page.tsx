"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import ServicesEditor from "@/components/ServicesEditor";
import SaveButton from "@/components/SaveButton";
import { defaultHomeContent } from "@/data/defaultHomeContent";
import { getAuthHeaders, apiPut } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, {
    cache: "no-store",
    headers: getAuthHeaders(),
  }).then((r) => r.json());

export default function ServicesPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [services, setServices] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const servicesBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "services"
      );

      // If services block exists, use saved data as the new baseline
      // Only fall back to static defaults for completely new sites
      if (servicesBlock?.data?.services) {
        // Saved data becomes the new "defaults" - ensure all have IDs
        const servicesWithIds = servicesBlock.data.services.map(
          (service: any, index: number) => ({
            ...service,
            id: service.id || `service-${Date.now()}-${index}`,
          })
        );
        setServices(servicesWithIds);
      } else {
        // No saved data exists, use static defaults for brand new sites - add IDs
        const servicesWithIds = defaultHomeContent.services.services.map(
          (service: any, index: number) => ({
            ...service,
            id: `default-service-${Date.now()}-${index}`,
          })
        );
        setServices(servicesWithIds);
      }
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

      await apiPut(`/api/site/${siteId}`, { data: draftData });
      mutate("/api/site/me");
      alert("Services saved successfully!");
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
