// src/app/dashboard/create/page.tsx - Create New Mini Website
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSitePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create site");
      }

      const data = await response.json();
      router.push(`/admin/site/editor/${data.data._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title }));
    // Auto-generate slug
    if (
      !formData.slug ||
      formData.slug ===
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
    ) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Create Your Mini Website</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Site Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Site Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="My Awesome Website"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="my-awesome-website"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Your site will be available at: /site/
                {formData.slug || "your-slug"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.slug}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Website"}
          </button>
        </div>
      </form>
    </div>
  );
}
