"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Check } from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  {
    id: "freelancer-template-1",
    name: "Freelancer Pro",
    category: "Freelancer",
    description: "Perfect for freelancers and consultants",
    image: "/templates/freelancer-1.jpg",
    preview: "/templates/freelancer-template-1",
  },
  {
    id: "business-template-1",
    name: "Business Classic",
    category: "Business",
    description: "Professional business website template",
    image: "/templates/business-1.jpg",
    preview: "/templates/business-template-1",
  },
  {
    id: "creative-template-1",
    name: "Creative Studio",
    category: "Creative",
    description: "Showcase your creative work",
    image: "/templates/creative-1.jpg",
    preview: "/templates/creative-template-1",
  },
  {
    id: "services-template-1",
    name: "Services Hub",
    category: "Services",
    description: "Ideal for service-based businesses",
    image: "/templates/services-1.jpg",
    preview: "/templates/services-template-1",
  },
  {
    id: "consultant-template-1",
    name: "Consultant Elite",
    category: "Consultant",
    description: "Premium consultant website",
    image: "/templates/consultant-1.jpg",
    preview: "/templates/consultant-template-1",
  },
];

const categories = [
  "All",
  "Freelancer",
  "Business",
  "Creative",
  "Services",
  "Consultant",
];

export default function TemplatePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleApplyTemplate = () => {
    // TODO: Implement template application
    console.log("Applying template:", selectedTemplate.id);
    setPreviewOpen(false);
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
            <h1 className="text-3xl font-bold text-gray-900">
              Choose a Template
            </h1>
            <p className="text-gray-600 mt-2">
              Select a beautiful template to get started with your website
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {/* Placeholder for template screenshot */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mb-2 mx-auto">
                        <Check className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {template.name}
                      </p>
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => handlePreview(template)}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePreview(template)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      onClick={handleApplyTemplate}
                      size="sm"
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name} Preview</DialogTitle>
            </DialogHeader>

            <div className="aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden">
              {selectedTemplate && (
                <iframe
                  src={selectedTemplate.preview}
                  className="w-full h-full border-0"
                  title={`${selectedTemplate.name} Preview`}
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyTemplate}>Apply Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
