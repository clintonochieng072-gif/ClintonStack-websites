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
import { useSite } from "@/lib/siteContext";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";

function AddPropertyPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get("id") || null;
  const isEditing = !!editId;
  const { site, loading: siteLoading, error: siteError } = useSite();

  // Fetch categories from the categories API
  const { data: categories } = useSWR("/api/category", (url: string) =>
    fetch(url, {
      cache: "no-store",
      headers: getAuthHeaders(),
    }).then((r) => r.json())
  );

  // Helper function to convert property type value back to display name
  const getPropertyTypeDisplay = (value: string) => {
    // Handle both old format (spaces) and new format (hyphens)
    return value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const [selectedPropertyType, setSelectedPropertyType] = useState("");

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
        (p: any) => p.id === editId || p._id === editId
      );

      if (property) {
        // Ensure all form fields are strings to avoid null value errors in controlled inputs
        setFormData({
          title: property.title || "",
          description: property.description || "",
          price: property.price || "",
          location: property.location || "",
          bedrooms: property.bedrooms || "",
          bathrooms: property.bathrooms || "",
          sqft: property.sqft || "",
          propertyType: property.propertyType || "",
          status: property.status || "for-sale",
          images: property.images || [],
        });
        setSelectedPropertyType(property.propertyType || "");
      }
    }
  }, [isEditing, editId, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!site) {
      alert("Site data not loaded yet. Please wait.");
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

      let newProperty: any;
      if (isEditing) {
        // Update existing property
        const index = propertiesBlock.data.properties.findIndex(
          (p: any) => p.id === editId || p._id === editId
        );
        if (index !== -1) {
          propertiesBlock.data.properties[index] = {
            ...propertiesBlock.data.properties[index],
            ...formData,
          };
          newProperty = propertiesBlock.data.properties[index];
        }
      } else {
        // Add new property with ID
        newProperty = {
          ...formData,
          id: Date.now().toString(), // Simple ID generation
          createdAt: new Date().toISOString(),
        };
        propertiesBlock.data.properties.push(newProperty);
      }

      // Optimistic update: update SWR cache immediately
      mutate(
        "/api/site/me",
        (currentData: any) => {
          if (!currentData?.data) return currentData;
          const updatedSite = { ...currentData.data };
          updatedSite.userWebsite = { ...updatedSite.userWebsite };
          updatedSite.userWebsite.draft = draftData;
          return { ...currentData, data: updatedSite };
        },
        false
      ); // false = don't revalidate immediately

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
        // Revert optimistic update on failure
        mutate("/api/site/me");
        alert(`Failed to save property: ${error.error || "Unknown error"}`);
        return;
      }

      // Success - property is already shown optimistically
      alert("Property saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      // Revert optimistic update on error
      mutate("/api/site/me");
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

  if (siteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading site data...</p>
        </div>
      </div>
    );
  }

  if (siteError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Site
          </h1>
          <p className="text-gray-600">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        {/* Basic Information */}
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
                Property Type
              </label>
              <select
                value={selectedPropertyType}
                onChange={(e) => {
                  setSelectedPropertyType(e.target.value);
                  updateFormData("propertyType", e.target.value);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select property type</option>
                {categories?.map((category: any) => (
                  <option key={category._id} value={category.name}>
                    {getPropertyTypeDisplay(category.name)}
                  </option>
                )) || (
                  <>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData("status", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

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
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Property Images */}
        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              onChange={addImage}
              placeholder="Upload property images (multiple allowed)"
              multiple={true}
            />
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              type="submit"
              disabled={isSubmitting || siteLoading}
              className={`bg-blue-600 hover:bg-blue-700 transition-all px-8 py-3 min-h-[44px] ${
                isSubmitting || siteLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
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
