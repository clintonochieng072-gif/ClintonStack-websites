"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import ImageUpload from "@/components/ImageUpload";
import SaveButton from "@/components/SaveButton";
import { defaultHomeContent } from "@/data/defaultHomeContent";
import { getAuthHeaders } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url, {
    cache: "no-store",
    headers: getAuthHeaders(),
  }).then((r) => r.json());

export default function GalleryPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      const galleryBlock = site.userWebsite?.draft?.blocks?.find(
        (b: any) => b.type === "gallery"
      );

      // If gallery block exists, use saved data as the new baseline
      // Only fall back to static defaults for completely new sites
      if (galleryBlock?.data?.images || galleryBlock?.data?.photos) {
        // Saved data becomes the new "defaults"
        setImages(galleryBlock.data.images || galleryBlock.data.photos);
      } else {
        // No saved data exists, use static defaults for brand new sites
        setImages(defaultHomeContent.gallery.images);
      }
    }
  }, [siteData]);

  const addImage = (url: string) => {
    setImages([...images, url]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!siteData?.data) return;

    setIsSaving(true);
    try {
      const siteId = siteData.data._id;
      const draftData = siteData.data.userWebsite?.draft || {};

      // Find or create gallery block
      let galleryBlock = draftData.blocks?.find(
        (b: any) => b.type === "gallery"
      );
      if (!galleryBlock) {
        galleryBlock = { type: "gallery", data: {} };
        draftData.blocks = draftData.blocks || [];
        draftData.blocks.push(galleryBlock);
      }

      galleryBlock.data = { images };

      const response = await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: draftData }),
      });

      if (response.ok) {
        mutate("/api/site/me");
        alert("Gallery saved successfully!");
      } else {
        alert("Failed to save gallery");
      }
    } catch (error) {
      alert("Error saving gallery");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery</h2>
          <p className="text-gray-600">
            Upload and manage images for your gallery section
          </p>
        </div>
        <ImageUpload value="" onChange={addImage} placeholder="Add Image" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t">
        <SaveButton
          onClick={handleSave}
          loading={isSaving}
          text="Save Gallery"
          loadingText="Saving Gallery..."
        />
      </div>
    </div>
  );
}
