"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, X, Edit, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  alt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([
    // Mock data
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
      caption: "Beautiful landscape",
      alt: "Landscape photo",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      caption: "Mountain view",
      alt: "Mountain landscape",
    },
  ]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Mock upload - in real app, upload to server
    const newImages: GalleryImage[] = acceptedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      url: URL.createObjectURL(file),
      caption: "",
      alt: file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setUploadOpen(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleEditCaption = (image: GalleryImage) => {
    setEditingImage(image);
    setEditCaption(image.caption);
  };

  const saveCaption = () => {
    if (editingImage) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id ? { ...img, caption: editCaption } : img
        )
      );
      setEditingImage(null);
      setEditCaption("");
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600 mt-2">
              Manage your photo gallery and showcase your work
            </p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="group overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditCaption(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {image.caption || "No caption"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add new image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * images.length }}
          >
            <Card
              className="aspect-square border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => setUploadOpen(true)}
            >
              <div className="text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add Photo</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Upload Modal */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Photos</DialogTitle>
            </DialogHeader>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">
                  Drop the files here...
                </p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop photos here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Caption Modal */}
        <Dialog
          open={!!editingImage}
          onOpenChange={() => setEditingImage(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Caption</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {editingImage && (
                <div className="aspect-square w-32 h-32 mx-auto rounded-lg overflow-hidden">
                  <img
                    src={editingImage.url}
                    alt={editingImage.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <Input
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Enter a caption for this image"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button onClick={saveCaption}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
