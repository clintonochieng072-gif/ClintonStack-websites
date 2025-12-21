"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { getAuthHeaders } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | string[]) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

// For backward compatibility, allow legacy onChange
type ImageUploadPropsLegacy = {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  multiple?: never; // multiple should not be set for legacy
};

type ImageUploadPropsCombined = Omit<ImageUploadProps, "onChange"> & {
  onChange: any; // Allow both legacy and new onChange
};

// Backward compatibility type
type LegacyOnChange = (url: string) => void;

export default function ImageUpload(props: ImageUploadPropsCombined) {
  const {
    value,
    onChange,
    placeholder = "Click to upload image",
    className = "",
    multiple = false,
  } = props;
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value prop changes
  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (files: FileList | File) => {
    const fileList = files instanceof FileList ? Array.from(files) : [files];

    if (fileList.length === 0) return;

    // Validate files
    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        alert("Please select image files only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Each file size must be less than 5MB");
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = fileList.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        try {
          const authHeaders = getAuthHeaders();
          // Remove Content-Type for FormData uploads (browser sets it automatically)
          delete authHeaders["Content-Type"];

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: authHeaders,
            body: formData,
            signal: controller.signal,
            credentials: "include",
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          return data.url;
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Upload timed out. Please try again.");
          }
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);

      if (multiple) {
        // For multiple, pass array of URLs
        (onChange as (url: string | string[]) => void)(urls);
      } else {
        // For single, set preview and pass single URL
        const url = urls[0];
        setPreview(url);
        onChange(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image(s). Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => {
          const files = e.target.files;
          if (files) handleFileSelect(multiple ? files : files[0]);
        }}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{placeholder}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
