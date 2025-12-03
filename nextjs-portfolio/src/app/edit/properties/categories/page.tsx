"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function CategoriesPage() {
  const { data: categories, mutate: mutateCategories } = useSWR(
    "/api/category",
    fetcher
  );
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize default categories if none exist
    if (categories && categories.length === 0) {
      const defaultCategories = [
        "House",
        "Apartment",
        "Condo",
        "Townhouse",
        "Land",
      ];
      Promise.all(
        defaultCategories.map((name) =>
          fetch("/api/category", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          })
        )
      ).then(() => mutateCategories());
    }
  }, [categories, mutateCategories]);

  const handleAdd = async () => {
    if (newCategory.trim()) {
      setIsAdding(true);
      try {
        const response = await fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory.trim() }),
        });

        if (response.ok) {
          setNewCategory("");
          mutateCategories();
          alert("Category added successfully!");
        } else {
          alert("Failed to add category");
        }
      } catch (error) {
        alert("Error adding category");
      }
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleSaveEdit = async () => {
    if (editingValue.trim() && editingId) {
      setIsEditing(true);
      try {
        // For simplicity, delete and recreate (since name is unique)
        await fetch("/api/category", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId }),
        });

        await fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editingValue.trim() }),
        });

        setEditingId(null);
        setEditingValue("");
        mutateCategories();
        alert("Category updated successfully!");
      } catch (error) {
        alert("Error updating category");
      }
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setDeletingId(id);
      try {
        const response = await fetch("/api/category", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          mutateCategories();
          alert("Category deleted successfully!");
        } else {
          alert("Failed to delete category");
        }
      } catch (error) {
        alert("Error deleting category");
      }
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Categories
        </h2>
        <p className="text-gray-600">
          Manage categories for organizing your properties
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                onClick={handleAdd}
                disabled={isAdding}
                className={`bg-blue-600 hover:bg-blue-700 transition-all ${
                  isAdding ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories?.length === 0 ? (
              <p className="text-gray-500">
                No categories yet. Add your first category above.
              </p>
            ) : (
              categories?.map((category: any) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  {editingId === category._id ? (
                    <div className="flex space-x-2 flex-1">
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSaveEdit()
                        }
                        className="flex-1"
                      />
                      <motion.div whileTap={{ scale: 0.96 }}>
                        <Button
                          onClick={handleSaveEdit}
                          disabled={isEditing}
                          size="sm"
                          className={`transition-all ${
                            isEditing ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isEditing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </motion.div>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{category.name}</span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() =>
                            handleEdit(category._id, category.name)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <motion.div whileTap={{ scale: 0.96 }}>
                          <Button
                            onClick={() => handleDelete(category._id)}
                            disabled={deletingId === category._id}
                            variant="outline"
                            size="sm"
                            className={`text-red-600 hover:text-red-700 transition-all ${
                              deletingId === category._id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {deletingId === category._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
