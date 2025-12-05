"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { useSite } from "../../layout";
import useSWR from "swr";
import { mutate } from "swr";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";

function AddPropertyPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get("id") || null;
  const isEditing = !!editId;
  const { site } = useSite();

  // Get categories from global API
  const { data: categoriesData } = useSWR("/api/category", (url: string) =>
    fetch(url, {
      cache: "no-store",
      headers: getAuthHeaders()
    }).then((r) => r.json())
  );

  // Default categories to show first
  const defaultCategories = [
    "House",
    "Apartment",
    "Condo",
    "Townhouse",
    "Land",
  ];

  // Sort categories: defaults first, then custom ones
  const categories = categoriesData || [];
  const sortedCategories = [
    ...defaultCategories.filter((cat) =>
      categories.some((c: any) => c.name === cat)
    ),
    ...categories.filter((cat: any) => !defaultCategories.includes(cat.name)),
  ];

  // Helper function to convert property type value back to display name
  const getPropertyTypeDisplay = (value: string) => {
    // Handle both old format (spaces) and new format (hyphens)
    return value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    propertyType: "",
    status: "for-sale",
    images: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && site) {
      const propertiesBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "properties"
      );
      const property = propertiesBlock?.data?.properties?.find(
        (p: any) => p.id === editId
      );

      if (property) {
        setFormData(property);
      }
    }
  }, [isEditing, editId, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!site) {
      alert("Site data not available");
      return;
    }

    setIsSubmitting(true);
    try {
      const siteId = site._id;

      // Get current draft data
      const draftData = site.userWebsite?.draft || {};

      // Find or create properties block in draft
      let propertiesBlock = draftData.blocks?.find(
        (b: any) => b.type === "properties"
      );
      if (!propertiesBlock) {
        propertiesBlock = {
          type: "properties",
          data: { properties: [] },
        };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(propertiesBlock);
      }

      propertiesBlock.data.properties = propertiesBlock.data.properties || [];

      if (isEditing) {
        // Update existing property
        const index = propertiesBlock.data.properties.findIndex(
          (p: any) => p.id === editId
        );
        if (index !== -1) {
          propertiesBlock.data.properties[index] = {
            ...propertiesBlock.data.properties[index],
            ...formData,
          };
        }
      } else {
        // Add new property with ID
        const newProperty = {
          ...formData,
          id: Date.now().toString(), // Simple ID generation
          createdAt: new Date().toISOString(),
        };
        propertiesBlock.data.properties.push(newProperty);
      }

      // Update site draft
      const updateRes = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          data: draftData,
        }),
      });

      if (!updateRes.ok) {
        const error = await updateRes.json();
        alert(`Failed to save property: ${error.error || "Unknown error"}`);
        return;
      }

      // Success - update SWR cache and stay on page
      mutate("/api/site/me");
      alert("Property saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save property. Please try again.");
    }
    setIsSubmitting(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addImage = (url: string | string[]) => {
    const urls = Array.isArray(url) ? url : [url];
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/edit/properties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Property" : "Add New Property"}
          </h2>
          <p className="text-gray-600">
            {isEditing
              ? "Update your property listing"
              : "Create a new property listing"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="e.g., Modern 3BR Apartment Downtown"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Detailed description of the property"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  placeholder="250000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => updateFormData("bedrooms", e.target.value)}
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => updateFormData("bathrooms", e.target.value)}
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Feet
                </label>
                <Input
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => updateFormData("sqft", e.target.value)}
                  placeholder="1500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) =>
                    updateFormData("propertyType", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Property Type</option>
                  {sortedCategories.map((category: any, index: number) => {
                    const value = category.name
                      ? category.name.toLowerCase().replace(/\s+/g, "-")
                      : category.toLowerCase().replace(/\s+/g, "-");
                    const display = category.name || category;
                    return (
                      <option key={index} value={value}>
                        {display}
                      </option>
                    );
                  })}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No property types available. Add categories in Properties
                    Manager.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData("status", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              onChange={addImage}
              placeholder="Upload property images"
              multiple={true}
            />
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 transition-all ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Update Property" : "Save Property"}
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}

export default function AddPropertyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPropertyPageContent />
    </Suspense>
  );
}
