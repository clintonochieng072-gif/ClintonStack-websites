"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface GalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function GalleryEditor({
  images,
  onChange,
}: GalleryEditorProps) {
  // Normalize images to ensure it's always an array
  const imageItems = Array.isArray(images) ? images : [];

  const handleAddImage = (url: string) => {
    onChange([...imageItems, url]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = imageItems.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gallery Images</h3>
        <div className="w-48">
          <ImageUpload
            onChange={handleAddImage}
            placeholder="Add image"
            className="h-24"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageItems.map((image, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {imageItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No images added yet.</p>
            <p className="text-sm">Use the upload area above to add images.</p>
          </div>
        )}
      </div>
    </div>
  );
}
