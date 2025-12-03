"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, Star } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Testimonial {
  id?: string;
  name: string;
  title?: string;
  comment: string;
  rating?: number;
  avatar?: string;
}

interface TestimonialsEditorProps {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
}

export default function TestimonialsEditor({
  testimonials,
  onChange,
}: TestimonialsEditorProps) {
  // Normalize testimonials to ensure it's always an array
  const testimonialItems = Array.isArray(testimonials) ? testimonials : [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Testimonial>({
    name: "",
    title: "",
    comment: "",
    rating: 5,
    avatar: "",
  });

  const handleAdd = () => {
    const newId = Date.now().toString();
    const newTestimonial: Testimonial = {
      id: newId,
      name: "",
      title: "",
      comment: "",
      rating: 5,
      avatar: "",
    };
    setEditingId(newId);
    setEditForm(newTestimonial);
    onChange([...testimonialItems, newTestimonial]);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id || "");
    setEditForm({ ...testimonial });
  };

  const handleSave = () => {
    const updatedTestimonials = testimonialItems.map((testimonial) =>
      testimonial.id === editingId
        ? { ...editForm, id: editingId }
        : testimonial
    );
    onChange(updatedTestimonials);
    setEditingId(null);
    setEditForm({ name: "", title: "", comment: "", rating: 5, avatar: "" });
  };

  const handleCancel = () => {
    if (!editForm.name && !editForm.comment) {
      // If it's a new empty testimonial, remove it
      onChange(testimonialItems.filter((t) => t.id !== editingId));
    }
    setEditingId(null);
    setEditForm({ name: "", title: "", comment: "", rating: 5, avatar: "" });
  };

  const handleDelete = (id: string) => {
    onChange(testimonialItems.filter((testimonial) => testimonial.id !== id));
  };

  const updateEditForm = (field: keyof Testimonial, value: string | number) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Testimonials</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="space-y-4">
        {testimonialItems.map((testimonial) => (
          <Card key={testimonial.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  {testimonial.name || "Anonymous"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                    disabled={editingId === testimonial.id}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id || "")}
                    disabled={editingId === testimonial.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingId === testimonial.id ? (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => updateEditForm("name", e.target.value)}
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (optional)
                    </label>
                    <Input
                      value={editForm.title || ""}
                      onChange={(e) => updateEditForm("title", e.target.value)}
                      placeholder="e.g., CEO, Homeowner"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <Textarea
                    value={editForm.comment}
                    onChange={(e) => updateEditForm("comment", e.target.value)}
                    placeholder="Testimonial text"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    value={editForm.rating || 5}
                    onChange={(e) =>
                      updateEditForm("rating", parseInt(e.target.value))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Star{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar (optional)
                  </label>
                  <ImageUpload
                    value={editForm.avatar || ""}
                    onChange={(url: string) => updateEditForm("avatar", url)}
                    placeholder="Upload avatar"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <div className="flex items-center mb-2">
                  {renderStars(testimonial.rating || 5)}
                </div>
                <blockquote className="text-gray-600 italic mb-3">
                  "{testimonial.comment}"
                </blockquote>
                <div className="flex items-center">
                  {testimonial.avatar && (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                  )}
                  <div>
                    <cite className="font-semibold text-gray-900">
                      {testimonial.name}
                    </cite>
                    {testimonial.title && (
                      <p className="text-sm text-gray-600">
                        {testimonial.title}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {testimonialItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No testimonials added yet. Click "Add Testimonial" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
