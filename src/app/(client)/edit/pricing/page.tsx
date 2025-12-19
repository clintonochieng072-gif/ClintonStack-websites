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

export default function PricingPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [plans, setPlans] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const pricingBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "pricing"
      );

      // If pricing block exists, use saved data as the new baseline
      // Only fall back to static defaults for completely new sites
      if (pricingBlock?.data?.plans) {
        // Saved data becomes the new "defaults"
        setPlans(pricingBlock.data.plans);
      } else {
        // No saved data exists, use static defaults for brand new sites
        setPlans(defaultHomeContent.pricing.plans);
      }
    }
  }, [siteData]);

  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  const updatePlanFeature = (
    planIndex: number,
    featureIndex: number,
    value: string
  ) => {
    const newPlans = [...plans];
    const features = [...(newPlans[planIndex].features || [])];
    features[featureIndex] = value;
    newPlans[planIndex].features = features;
    setPlans(newPlans);
  };

  const addPlan = () => {
    setPlans([...plans, { name: "", price: "", features: [""] }]);
  };

  const removePlan = (index: number) => {
    setPlans(plans.filter((_: any, i: number) => i !== index));
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex].features = [
      ...(newPlans[planIndex].features || []),
      "",
    ];
    setPlans(newPlans);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex].features = newPlans[planIndex].features.filter(
      (_: string, i: number) => i !== featureIndex
    );
    setPlans(newPlans);
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setIsSaving(true);
    try {
      const siteId = siteData.data._id;
      const draftData = siteData.data.userWebsite?.draft || {};

      // Find or create pricing block
      let pricingBlock = draftData.blocks?.find(
        (b: any) => b.type === "pricing"
      );
      if (!pricingBlock) {
        pricingBlock = { type: "pricing", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(pricingBlock);
      }

      pricingBlock.data = { plans };

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Pricing section saved successfully!");
      } else {
        alert("Failed to save pricing section");
      }
    } catch (error) {
      alert("Error saving pricing section");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pricing Section
          </h2>
          <p className="text-gray-600">
            Manage your pricing plans and features
          </p>
        </div>
        <button
          onClick={addPlan}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Plan
        </button>
      </div>

      <div className="space-y-6">
        {plans.map((plan, planIndex) => (
          <div
            key={planIndex}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Plan {planIndex + 1}</h3>
              <button
                onClick={() => removePlan(planIndex)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name
                </label>
                <Input
                  value={plan.name || ""}
                  onChange={(e) =>
                    updatePlan(planIndex, "name", e.target.value)
                  }
                  placeholder="e.g., Basic Plan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <Input
                  value={plan.price || ""}
                  onChange={(e) =>
                    updatePlan(planIndex, "price", e.target.value)
                  }
                  placeholder="e.g., $99/month"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Features
                </label>
                <button
                  onClick={() => addFeature(planIndex)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add Feature
                </button>
              </div>
              {plan.features?.map((feature: string, featureIndex: number) => (
                <div key={featureIndex} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) =>
                      updatePlanFeature(planIndex, featureIndex, e.target.value)
                    }
                    placeholder="Feature description"
                  />
                  <button
                    onClick={() => removeFeature(planIndex, featureIndex)}
                    className="text-red-600 hover:text-red-800 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t">
        <SaveButton
          onClick={handleSave}
          loading={isSaving}
          text="Save Pricing"
          loadingText="Saving Pricing..."
        />
      </div>
    </div>
  );
}
