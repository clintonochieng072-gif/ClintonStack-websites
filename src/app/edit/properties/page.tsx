"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSite } from "../layout";
import { getAuthHeaders } from "@/lib/utils";
import { mutate } from "swr";

export default function PropertiesPage() {
  const { site, loading } = useSite();
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (site) {
      const props =
        site.userWebsite?.draft?.blocks?.find(
          (b: any) => b.type === "properties"
        )?.data?.properties || [];
      setProperties(props);
    }
  }, [site]);

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      // Get current site data
      const siteRes = await fetch("/api/site/me", {
        headers: getAuthHeaders(),
      });
      const siteData = await siteRes.json();
      if (!siteData.data) {
        alert("Failed to load site data");
        return;
      }

      const site = siteData.data;
      const siteId = site._id;

      // Get current draft data
      const draftData = site.userWebsite?.draft || {};

      // Find properties block in draft
      const propertiesBlock = draftData.blocks?.find(
        (b: any) => b.type === "properties"
      );
      if (propertiesBlock) {
        const beforeCount = propertiesBlock.data.properties?.length || 0;
        propertiesBlock.data.properties =
          propertiesBlock.data.properties.filter(
            (p: any) => p.id !== propertyId && p._id !== propertyId
          );
        const afterCount = propertiesBlock.data.properties?.length || 0;
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
        alert(`Failed to delete property: ${error.error || "Unknown error"}`);
        return;
      }

      // Update local properties state immediately for instant UI feedback
      setProperties((prev) =>
        prev.filter((p) => (p._id || p.id) !== propertyId)
      );

      // Invalidate SWR cache to update the layout's site context
      mutate("/api/site/me");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete property. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All Properties
          </h2>
          <p className="text-gray-600">Manage your real estate listings</p>
        </div>
        <Link href="/edit/properties/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Property
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {properties.length === 0 ? (
          <Card key="empty">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by adding your first property listing
                </p>
                <Link href="/edit/properties/add">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          properties.map((property, index) => (
            <Card key={property._id || property.id || index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {property.images && property.images.length > 0 && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {property.title}
                      </h3>
                      <p className="text-gray-500">{property.location}</p>
                      <p className="text-lg font-semibold text-blue-600">
                        KES {property.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/edit/properties/add?id=${
                        property._id || property.id
                      }`}
                    >
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property._id || property.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
