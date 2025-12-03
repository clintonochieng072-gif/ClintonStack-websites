"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatar?: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    // Mock data
    {
      id: "1",
      name: "John Doe",
      rating: 5,
      comment:
        "Amazing work! Clinton delivered exactly what I needed and exceeded my expectations.",
      avatar: "",
    },
    {
      id: "2",
      name: "Jane Smith",
      rating: 5,
      comment:
        "Professional, reliable, and creative. Highly recommend for any project.",
      avatar: "",
    },
  ]);

  const [addOpen, setAddOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const resetForm = () => {
    setFormData({ name: "", rating: 5, comment: "" });
  };

  const handleAdd = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      ...formData,
    };
    setTestimonials((prev) => [...prev, newTestimonial]);
    setAddOpen(false);
    resetForm();
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      rating: testimonial.rating,
      comment: testimonial.comment,
    });
  };

  const handleUpdate = () => {
    if (editingTestimonial) {
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === editingTestimonial.id ? { ...t, ...formData } : t
        )
      );
      setEditingTestimonial(null);
      resetForm();
    }
  };

  const handleDelete = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const TestimonialCard = ({
    testimonial,
    index,
  }: {
    testimonial: Testimonial;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
              <AvatarFallback>
                {testimonial.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {testimonial.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center mb-3">
                {renderStars(testimonial.rating)}
              </div>

              <p className="text-gray-600 italic">"{testimonial.comment}"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
            <p className="text-gray-600 mt-2">
              Manage customer reviews and testimonials for your website
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {/* Testimonials List */}
        <div className="space-y-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}

          {testimonials.length === 0 && (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Star className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No testimonials yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your first customer testimonial to showcase social proof
                </p>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Testimonial
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Dialog
          open={addOpen || !!editingTestimonial}
          onOpenChange={(open) => {
            if (!open) {
              setAddOpen(false);
              setEditingTestimonial(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="Customer testimonial"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  setEditingTestimonial(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingTestimonial ? handleUpdate : handleAdd}>
                {editingTestimonial ? "Update" : "Add"} Testimonial
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
