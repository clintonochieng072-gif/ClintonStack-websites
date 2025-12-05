"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());

export default function IntegrationsPage() {
  console.log("IntegrationsPage component loaded");
  const router = useRouter();
  const { data: siteData, error: siteError } = useSWR("/api/site/me", fetcher);
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    if (siteData?.data) {
      console.log("Site data loaded:", siteData.data);
      setSite(siteData.data);
    }
  }, [siteData]);

  const { data: integrationsData, mutate } = useSWR(
    site?._id ? `/api/site/${site._id}/integrations` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [integrations, setIntegrations] = useState<any>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (integrationsData?.integrations) {
      console.log("Integrations data loaded:", integrationsData.integrations);
      setIntegrations(integrationsData.integrations);
    }
  }, [integrationsData]);

  const handleSave = async (field: string) => {
    if (!site?._id) return;

    console.log(`Saving ${field}:`, integrations[field]);
    setSaving((prev) => ({ ...prev, [field]: true }));
    try {
      const response = await fetch(`/api/site/${site._id}/integrations`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          integrations: { [field]: integrations[field] },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      mutate();
      router.refresh();
      alert("Saved successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [field]: false }));
    }
  };

  const updateIntegration = (field: string, value: string) => {
    setIntegrations((prev: any) => ({ ...prev, [field]: value }));
  };

  if (siteError || !site) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {siteError ? "Error Loading Site" : "Loading..."}
            </h1>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrations
          </h1>
          <p className="text-gray-600">
            Connect third-party services to enhance your website functionality.
          </p>
        </div>

        {/* Chat Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Chat & Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Phone & WhatsApp Contacts</strong>
                <br />
                Add your phone number or WhatsApp number to show floating
                contact buttons on your site. Visitors will be able to call or
                message you directly.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.phoneNumber || ""}
                  onChange={(e) =>
                    updateIntegration("phoneNumber", e.target.value)
                  }
                  placeholder="+254 712 345 678"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("phoneNumber")}
                  disabled={saving.phoneNumber}
                >
                  {saving.phoneNumber ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.whatsappNumber || ""}
                  onChange={(e) =>
                    updateIntegration("whatsappNumber", e.target.value)
                  }
                  placeholder="e.g., +1234567890"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("whatsappNumber")}
                  disabled={saving.whatsappNumber}
                >
                  {saving.whatsappNumber ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Live Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tawk.to ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.tawkToId || ""}
                  onChange={(e) =>
                    updateIntegration("tawkToId", e.target.value)
                  }
                  placeholder="Your Tawk.to widget ID"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("tawkToId")}
                  disabled={saving.tawkToId}
                >
                  {saving.tawkToId ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crisp ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.crispId || ""}
                  onChange={(e) => updateIntegration("crispId", e.target.value)}
                  placeholder="Your Crisp website ID"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("crispId")}
                  disabled={saving.crispId}
                >
                  {saving.crispId ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Analytics ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.googleAnalyticsId || ""}
                  onChange={(e) =>
                    updateIntegration("googleAnalyticsId", e.target.value)
                  }
                  placeholder="e.g., G-XXXXXXXXXX"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("googleAnalyticsId")}
                  disabled={saving.googleAnalyticsId}
                >
                  {saving.googleAnalyticsId ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Tag Manager ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.googleTagManagerId || ""}
                  onChange={(e) =>
                    updateIntegration("googleTagManagerId", e.target.value)
                  }
                  placeholder="e.g., GTM-XXXXXXX"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("googleTagManagerId")}
                  disabled={saving.googleTagManagerId}
                >
                  {saving.googleTagManagerId ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Pixel ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.metaPixelId || ""}
                  onChange={(e) =>
                    updateIntegration("metaPixelId", e.target.value)
                  }
                  placeholder="Your Meta Pixel ID"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("metaPixelId")}
                  disabled={saving.metaPixelId}
                >
                  {saving.metaPixelId ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Marketing */}
        <Card>
          <CardHeader>
            <CardTitle>Email Marketing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mailchimp API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.mailchimpApiKey || ""}
                  onChange={(e) =>
                    updateIntegration("mailchimpApiKey", e.target.value)
                  }
                  placeholder="Your Mailchimp API Key"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("mailchimpApiKey")}
                  disabled={saving.mailchimpApiKey}
                >
                  {saving.mailchimpApiKey ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mailchimp List ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.mailchimpListId || ""}
                  onChange={(e) =>
                    updateIntegration("mailchimpListId", e.target.value)
                  }
                  placeholder="Your Mailchimp List ID"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("mailchimpListId")}
                  disabled={saving.mailchimpListId}
                >
                  {saving.mailchimpListId ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brevo API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.brevoApiKey || ""}
                  onChange={(e) =>
                    updateIntegration("brevoApiKey", e.target.value)
                  }
                  placeholder="Your Brevo API Key"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("brevoApiKey")}
                  disabled={saving.brevoApiKey}
                >
                  {saving.brevoApiKey ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maps */}
        <Card>
          <CardHeader>
            <CardTitle>Maps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps API Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={integrations.googleMapsApiKey || ""}
                  onChange={(e) =>
                    updateIntegration("googleMapsApiKey", e.target.value)
                  }
                  placeholder="Your Google Maps API Key"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave("googleMapsApiKey")}
                  disabled={saving.googleMapsApiKey}
                >
                  {saving.googleMapsApiKey ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Script */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Script</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom JavaScript
              </label>
              <Textarea
                value={integrations.customScript || ""}
                onChange={(e) =>
                  updateIntegration("customScript", e.target.value)
                }
                placeholder="<script>/* Your code here */</script>"
                rows={6}
                className="mb-2"
              />
              <Button
                onClick={() => handleSave("customScript")}
                disabled={saving.customScript}
              >
                {saving.customScript ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
