"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";
import { Image, Upload, Folder, Search, Grid, List } from "lucide-react";

export default function MediaLibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data - in real app, this would come from API
  const mediaItems = [
    {
      id: 1,
      name: "hero-image.jpg",
      type: "website",
      size: "2.3 MB",
      uploaded: "2024-01-15",
    },
    {
      id: 2,
      name: "property-1.jpg",
      type: "property",
      size: "1.8 MB",
      uploaded: "2024-01-14",
    },
    {
      id: 3,
      name: "logo.png",
      type: "website",
      size: "245 KB",
      uploaded: "2024-01-13",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Media Library
          </h1>
          <p className="text-gray-600">
            Manage all your images and media files
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Media</TabsTrigger>
          <TabsTrigger value="website">Website Images</TabsTrigger>
          <TabsTrigger value="property">Property Images</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Media Files</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.size}</div>
                      <div className="text-xs text-gray-500">{item.type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Image className="w-8 h-8 text-gray-400" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.size} • {item.type} • {item.uploaded}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems
                  .filter((item) => item.type === "website")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.size}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems
                  .filter((item) => item.type === "property")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.size}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
