"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Service {
  id?: string;
  title: string;
  description: string;
  price?: string;
  image?: string;
}

interface ServicesEditorProps {
  services: Service[];
  onChange: (services: Service[]) => void;
}

export default function ServicesEditor({
  services,
  onChange,
}: ServicesEditorProps) {
  // Normalize services to ensure it's always an array
  const serviceItems = Array.isArray(services) ? services : [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Service>({
    title: "",
    description: "",
    price: "",
    image: "",
  });

  const handleAdd = () => {
    const newId = Date.now().toString();
    const newService: Service = {
      id: newId,
      title: "",
      description: "",
      price: "",
      image: "",
    };
    setEditingId(newId);
    setEditForm(newService);
    onChange([...serviceItems, newService]);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id || "");
    setEditForm({ ...service });
  };

  const handleSave = () => {
    const updatedServices = serviceItems.map((service) =>
      service.id === editingId ? { ...editForm, id: editingId } : service
    );
    onChange(updatedServices);
    setEditingId(null);
    setEditForm({ title: "", description: "", price: "", image: "" });
  };

  const handleCancel = () => {
    if (!editForm.title && !editForm.description) {
      // If it's a new empty service, remove it
      onChange(serviceItems.filter((s) => s.id !== editingId));
    }
    setEditingId(null);
    setEditForm({ title: "", description: "", price: "", image: "" });
  };

  const handleDelete = (id: string) => {
    onChange(serviceItems.filter((service) => service.id !== id));
  };

  const updateEditForm = (field: keyof Service, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Services</h3>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </motion.div>
      </div>

      <div className="space-y-4">
        {serviceItems.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  {service.title || "Untitled Service"}
                </CardTitle>
                <div className="flex gap-2">
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      disabled={editingId === service.id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id || "")}
                      disabled={editingId === service.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardHeader>

            {editingId === service.id ? (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => updateEditForm("title", e.target.value)}
                    placeholder="Service title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) =>
                      updateEditForm("description", e.target.value)
                    }
                    placeholder="Service description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (optional)
                  </label>
                  <Input
                    value={editForm.price}
                    onChange={(e) => updateEditForm("price", e.target.value)}
                    placeholder="e.g., KES 5,000 or Contact for pricing"
                  />
                </div>
                <div className="flex gap-2">
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-gray-600 mb-2">{service.description}</p>
                {service.price && (
                  <p className="text-lg font-semibold text-blue-600">
                    {service.price}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {serviceItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No services added yet. Click "Add Service" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
