// src/app/admin/site/editor/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import EditorSidebar from "@/components/EditorSidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SiteEditor({ params }: { params: { id: string } }) {
  return <SiteEditorContent siteId={params.id} />;
}

function SiteEditorContent({ siteId }: { siteId: string }) {
  const { data: siteData, error } = useSWR(`/api/site/${siteId}`, fetcher);
  const [formData, setFormData] = useState<any>({});
  const [layout, setLayout] = useState("modern");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeSection, setActiveSection] = useState("homepage");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["website-sections"])
  );

  useEffect(() => {
    if (siteData?.data) {
      const draftData = siteData.data.data || {};
      const publishedData = siteData.data.userWebsite?.published || {};

      // For contactInformation, fall back to published if draft is empty
      if (!draftData.contactInformation && publishedData.contactInformation) {
        draftData.contactInformation = publishedData.contactInformation;
      }

      setFormData(draftData);
      setLayout(siteData.data.layout || "modern");
    }
  }, [siteData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/site/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData, layout }),
      });
      alert("Saved successfully!");
    } catch (error) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const response = await fetch("/api/site/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });

      if (response.ok) {
        alert("Website published successfully!");
        window.location.reload();
      } else {
        alert("Failed to publish website");
      }
    } catch (error) {
      alert("Error publishing website");
    } finally {
      setPublishing(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (error) return <div>Error loading site</div>;
  if (!siteData?.data) return <div>Loading...</div>;

  const site = siteData.data;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <EditorSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        expandedSections={expandedSections}
        onToggleSection={handleToggleSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit {site.title}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {publishing ? "Publishing..." : "🚀 Publish Website"}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <ContentPanel
            activeSection={activeSection}
            formData={formData}
            setFormData={setFormData}
            layout={layout}
            setLayout={setLayout}
          />
        </div>
      </div>
    </div>
  );
}

// Block Preview Component
function BlockPreview({ block, onEdit }: { block: any; onEdit: () => void }) {
  const getBlockTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      hero: "Hero Section",
      about: "About Section",
      company: "Company Section",
      services: "Services Section",
      gallery: "Gallery Section",
      testimonials: "Testimonials Section",
      contact: "Contact Section",
      listings: "Listings Section",
      agents: "Agents Section",
      faq: "FAQ Section",
    };
    return (
      titles[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Section`
    );
  };

  const renderBlockPreview = (block: any) => {
    switch (block.type) {
      case "hero":
        return (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Title:</strong>{" "}
              {block.data?.title || "Welcome to My Website"}
            </p>
            <p>
              <strong>Subtitle:</strong>{" "}
              {block.data?.subtitle || "Professional services..."}
            </p>
          </div>
        );
      case "services":
        const services = block.data?.services || block.data?.items || [];
        return (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Services:</strong> {services.length} items
            </p>
          </div>
        );
      case "gallery":
        const images = block.data?.images || [];
        return (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Images:</strong> {images.length} images
            </p>
          </div>
        );
      case "testimonials":
        const testimonials =
          block.data?.testimonials || block.data?.items || [];
        return (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Testimonials:</strong> {testimonials.length} reviews
            </p>
          </div>
        );
      case "contact":
        return (
          <div className="text-sm text-gray-600">
            <p>
              <strong>Email:</strong>{" "}
              {block.data?.email || "contact@example.com"}
            </p>
            <p>
              <strong>Phone:</strong> {block.data?.phone || "+1 (555) 123-4567"}
            </p>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-600">
            <p>Block content preview</p>
          </div>
        );
    }
  };

  return (
    <div className="relative border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{getBlockTitle(block.type)}</h3>
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          ✏️ Edit
        </button>
      </div>
      <div>{renderBlockPreview(block)}</div>
    </div>
  );
}

// Block Edit Drawer Component
function BlockEditDrawer({
  block,
  onSave,
  onClose,
}: {
  block: any;
  onSave: (block: any) => void;
  onClose: () => void;
}) {
  const [blockData, setBlockData] = useState<any>(block.data || {});

  const handleSave = () => {
    onSave({ ...block, data: blockData });
  };

  const updateField = (field: string, value: any) => {
    setBlockData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderEditor = () => {
    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={blockData.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Welcome to My Website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={blockData.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Professional services tailored to your needs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CTA Text</label>
              <input
                type="text"
                value={blockData.ctaText || ""}
                onChange={(e) => updateField("ctaText", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Get Started"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hero Image URL
              </label>
              <input
                type="url"
                value={blockData.heroImage || ""}
                onChange={(e) => updateField("heroImage", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        );

      case "services":
        return (
          <ServicesEditor
            data={blockData}
            onChange={(data: any) => setBlockData(data)}
          />
        );

      case "gallery":
        return (
          <GalleryEditor
            data={blockData}
            onChange={(data: any) => setBlockData(data)}
          />
        );

      case "testimonials":
        return (
          <TestimonialsEditor
            data={blockData}
            onChange={(data: any) => setBlockData(data)}
          />
        );

      case "contact":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={blockData.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={blockData.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={blockData.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="123 Business St, City, State 12345"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Editor for {block.type} block coming soon...
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Edit {block.type.charAt(0).toUpperCase() + block.type.slice(1)}{" "}
            Block
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderEditor()}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function FormEditor({ niche, data, onChange }: any) {
  const { data: config, error } = useSWR(`/api/niche/${niche}`, fetcher);

  if (error) return <div>Error loading config</div>;
  if (!config?.adminFields) return <div>Loading config...</div>;

  return (
    <div>
      {Object.entries(config.adminFields).map(
        ([section, fields]: [string, any]) => (
          <SectionEditor
            key={section}
            section={section}
            fields={fields}
            data={data[section] || {}}
            onChange={(d: any) => onChange(section, d)}
          />
        )
      )}
    </div>
  );
}

function SectionEditor({ section, fields, data, onChange }: any) {
  return (
    <div className="p-4 border mb-4 rounded">
      <h3 className="font-semibold capitalize mb-2">
        {section.replace("_", " ")}
      </h3>
      {Object.entries(fields).map(([field, type]: [string, any]) => (
        <FieldEditor
          key={field}
          field={field}
          type={type}
          value={data[field]}
          onChange={(v: any) => onChange({ [field]: v })}
        />
      ))}
    </div>
  );
}

function FieldEditor({ field, type, value, onChange }: any) {
  const label = field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str: string) => str.toUpperCase());

  switch (type) {
    case "text":
      return (
        <div className="mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );
    case "textarea":
      return (
        <div className="mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );
    case "email":
      return (
        <div className="mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <input
            type="email"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );
    case "number":
      return (
        <div className="mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );
    case "url":
      return (
        <div className="mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );
    case "image":
      return (
        <div className="mb-2">
          <label className="block text-sm font-medium">{label}</label>
          <input
            type="text"
            placeholder="Image URL"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      );
    case "array":
      // For arrays like services, testimonials, etc.
      return (
        <ArrayFieldEditor
          field={field}
          value={value || []}
          onChange={onChange}
        />
      );
    case "object":
      // For objects like pricing, schedule, etc.
      return (
        <ObjectFieldEditor
          field={field}
          value={value || {}}
          onChange={onChange}
        />
      );
    default:
      return <div>Unknown field type: {type}</div>;
  }
}

function ArrayFieldEditor({ field, value, onChange }: any) {
  const addItem = () => {
    onChange([...value, {}]);
  };

  const updateItem = (index: number, newData: any) => {
    const copy = [...value];
    copy[index] = { ...copy[index], ...newData };
    onChange(copy);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="mb-2">
      <label className="block text-sm font-medium capitalize">{field}</label>
      {value.map((item: any, i: number) => (
        <div key={i} className="border p-2 mb-2 rounded">
          {Object.keys(item).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={item[key] || ""}
              onChange={(e) => updateItem(i, { [key]: e.target.value })}
              className="w-full p-1 border rounded mb-1"
            />
          ))}
          <button onClick={() => removeItem(i)} className="text-red-600">
            Remove
          </button>
        </div>
      ))}
      <button onClick={addItem} className="px-3 py-1 bg-gray-200 rounded">
        Add {field.slice(0, -1)}
      </button>
    </div>
  );
}

function ObjectFieldEditor({ field, value, onChange }: any) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium capitalize">{field}</label>
      {Object.keys(value).map((key) => (
        <input
          key={key}
          placeholder={key}
          value={value[key] || ""}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          className="w-full p-2 border rounded mb-1"
        />
      ))}
    </div>
  );
}

// Minimal example editors below (expand as needed)
function ProfileEditor({ data, onChange }: any) {
  return (
    <div className="p-4 border mb-4">
      <h4 className="font-semibold">Profile</h4>
      <input
        defaultValue={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Name"
        className="w-full p-2 border rounded mt-2"
      />
      <input
        defaultValue={data.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
        className="w-full p-2 border rounded mt-2"
      />
      <textarea
        defaultValue={data.bio}
        onChange={(e) => onChange({ bio: e.target.value })}
        placeholder="Short bio"
        className="w-full p-2 border rounded mt-2"
      />
    </div>
  );
}

function ServicesEditor({ data, onChange }: any) {
  const services = data.items || [];
  function add() {
    const s = [...services, { title: "New service", description: "" }];
    onChange({ items: s });
  }
  function update(i: number, key: string, val: any) {
    const s = services.map((it: any, idx: number) =>
      idx === i ? { ...it, [key]: val } : it
    );
    onChange({ items: s });
  }
  return (
    <div className="p-4 border mb-4">
      <h4 className="font-semibold">Services</h4>
      {services.map((s: any, i: number) => (
        <div key={i} className="mb-2">
          <input
            value={s.title}
            onChange={(e) => update(i, "title", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            value={s.description}
            onChange={(e) => update(i, "description", e.target.value)}
            className="w-full p-2 border rounded mt-1"
          />
        </div>
      ))}
      <button onClick={add} className="mt-2 px-3 py-1 bg-gray-200 rounded">
        Add service
      </button>
    </div>
  );
}

function GalleryEditor({ data, onChange }: any) {
  // For now: accept comma separated urls
  return (
    <div className="p-4 border mb-4">
      <h4 className="font-semibold">Gallery</h4>
      <textarea
        defaultValue={(data.images || []).join(",")}
        onChange={(e) =>
          onChange({ images: e.target.value.split(",").map((s) => s.trim()) })
        }
        className="w-full p-2 border rounded"
      />
      <div className="text-sm text-gray-500 mt-1">
        Add image URLs separated by commas. Replace with upload later.
      </div>
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: any) {
  const items = data.items || [];
  function add() {
    onChange({ items: [...items, { name: "", text: "" }] });
  }
  function upd(i: number, key: string, v: any) {
    const copy = items.map((it: any, idx: number) =>
      idx === i ? { ...it, [key]: v } : it
    );
    onChange({ items: copy });
  }
  return (
    <div className="p-4 border mb-4">
      <h4 className="font-semibold">Testimonials</h4>
      {items.map((it: any, i: number) => (
        <div key={i} className="mb-2">
          <input
            value={it.name}
            onChange={(e) => upd(i, "name", e.target.value)}
            placeholder="Name"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={it.text}
            onChange={(e) => upd(i, "text", e.target.value)}
            placeholder="Testimonial"
            className="w-full p-2 border rounded mt-1"
          />
        </div>
      ))}
      <button onClick={add} className="mt-2 px-3 py-1 bg-gray-200 rounded">
        Add testimonial
      </button>
    </div>
  );
}

function EmergencyButtonEditor({ data, onChange }: any) {
  return (
    <div className="p-4 border mb-4">
      <h4 className="font-semibold">Emergency Button</h4>
      <input
        defaultValue={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Label (e.g. Call Now)"
        className="w-full p-2 border rounded mt-2"
      />
      <input
        defaultValue={data.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="Phone number"
        className="w-full p-2 border rounded mt-2"
      />
    </div>
  );
}

// Content Panel Component
function ContentPanel({
  activeSection,
  formData,
  setFormData,
  layout,
  setLayout,
}: {
  activeSection: string;
  formData: any;
  setFormData: (data: any) => void;
  layout: string;
  setLayout: (layout: string) => void;
}) {
  const updateFormData = (section: string, data: any) => {
    setFormData({ ...formData, [section]: data });
  };

  const renderContent = () => {
    switch (activeSection) {
      case "homepage":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Homepage Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Layout Style</h3>
              <div className="flex gap-4">
                {["minimal", "modern", "classic"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setLayout(style)}
                    className={`px-4 py-2 rounded capitalize ${
                      layout === style
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "hero":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Hero Section</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <HeroEditor
                data={formData.hero || {}}
                onChange={(data: any) => updateFormData("hero", data)}
              />
            </div>
          </div>
        );

      case "services":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Services Section</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ServicesEditor
                data={formData.services || {}}
                onChange={(data: any) => updateFormData("services", data)}
              />
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Testimonials Section</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <TestimonialsEditor
                data={formData.testimonials || {}}
                onChange={(data: any) => updateFormData("testimonials", data)}
              />
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About Section</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <AboutEditor
                data={formData.about || {}}
                onChange={(data: any) => updateFormData("about", data)}
              />
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Contact Section</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ContactEditor
                data={formData.contact || {}}
                onChange={(data: any) => updateFormData("contact", data)}
              />
            </div>
          </div>
        );

      case "featured-properties":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FeaturedPropertiesEditor
                properties={
                  formData.blocks?.find((b: any) => b.type === "properties")
                    ?.data?.list || []
                }
                featured={formData.featuredProperties || []}
                onChange={(featured: any) =>
                  updateFormData("featuredProperties", featured)
                }
              />
            </div>
          </div>
        );

      case "all-properties":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Properties</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <PropertiesList
                properties={
                  formData.blocks?.find((b: any) => b.type === "properties")
                    ?.data?.list || []
                }
                onChange={(properties: any) => {
                  const blocks = formData.blocks || [];
                  const propertiesBlockIndex = blocks.findIndex(
                    (b: any) => b.type === "properties"
                  );
                  if (propertiesBlockIndex >= 0) {
                    blocks[propertiesBlockIndex].data.list = properties;
                  } else {
                    blocks.push({
                      type: "properties",
                      data: { list: properties },
                    });
                  }
                  updateFormData("blocks", [...blocks]);
                }}
              />
            </div>
          </div>
        );

      case "add-property":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Add New Property</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <PropertyEditor
                property={{}}
                onSave={(property: any) => {
                  const blocks = formData.blocks || [];
                  const propertiesBlock = blocks.find(
                    (b: any) => b.type === "properties"
                  );
                  if (propertiesBlock) {
                    propertiesBlock.data.list = [
                      ...(propertiesBlock.data.list || []),
                      property,
                    ];
                  } else {
                    blocks.push({
                      type: "properties",
                      data: { list: [property] },
                    });
                  }
                  updateFormData("blocks", [...blocks]);
                }}
                onCancel={() => {}}
              />
            </div>
          </div>
        );

      case "categories":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Property Categories</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CategoriesEditor
                categories={formData.categories || []}
                onChange={(categories: any) =>
                  updateFormData("categories", categories)
                }
              />
            </div>
          </div>
        );

      case "property-gallery":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Property Gallery</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <GalleryEditor
                data={formData.propertyGallery || {}}
                onChange={(data: any) =>
                  updateFormData("propertyGallery", data)
                }
              />
            </div>
          </div>
        );

      case "website-gallery":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Website Gallery</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <GalleryEditor
                data={formData.websiteGallery || {}}
                onChange={(data: any) => updateFormData("websiteGallery", data)}
              />
            </div>
          </div>
        );

      case "logo":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Logo Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <LogoEditor
                data={formData.logo || {}}
                onChange={(data: any) => updateFormData("logo", data)}
              />
            </div>
          </div>
        );

      case "theme":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Theme Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ThemeEditor
                data={formData.theme || {}}
                onChange={(data: any) => updateFormData("theme", data)}
              />
            </div>
          </div>
        );

      case "colors":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Color Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ColorsEditor
                data={formData.colors || {}}
                onChange={(data: any) => updateFormData("colors", data)}
              />
            </div>
          </div>
        );

      case "fonts":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Font Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FontsEditor
                data={formData.fonts || {}}
                onChange={(data: any) => updateFormData("fonts", data)}
              />
            </div>
          </div>
        );

      case "seo":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">SEO Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <SEOEditor
                data={formData.seo || {}}
                onChange={(data: any) => updateFormData("seo", data)}
              />
            </div>
          </div>
        );

      case "contact-information":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ContactInformationEditor
                data={formData.contact || {}}
                onChange={(data: any) => updateFormData("contact", data)}
              />
            </div>
          </div>
        );

      case "domain":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Domain Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <DomainEditor
                data={formData.domain || {}}
                onChange={(data: any) => updateFormData("domain", data)}
              />
            </div>
          </div>
        );

      case "publish":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Publish Website</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <PublishEditor
                data={formData.publish || {}}
                onChange={(data: any) => updateFormData("publish", data)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a section to edit</p>
              <p className="text-sm">Choose an option from the sidebar</p>
            </div>
          </div>
        );
    }
  };

  return <div className="max-w-4xl">{renderContent()}</div>;
}

// Placeholder components for new sections
function HeroEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Welcome to My Website"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Subtitle</label>
        <input
          type="text"
          value={data.subtitle || ""}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Professional services tailored to your needs"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">CTA Text</label>
        <input
          type="text"
          value={data.ctaText || ""}
          onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Get Started"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Hero Image URL</label>
        <input
          type="url"
          value={data.heroImage || ""}
          onChange={(e) => onChange({ ...data, heroImage: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="About Us"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Tell your story..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          type="url"
          value={data.image || ""}
          onChange={(e) => onChange({ ...data, image: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="contact@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          value={data.phone || ""}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="+1 (555) 123-4567"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          value={data.address || ""}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="123 Business St, City, State 12345"
        />
      </div>
    </div>
  );
}

function PropertiesList({ properties, onChange }: any) {
  return (
    <div className="space-y-4">
      {properties.length === 0 ? (
        <p className="text-gray-500">No properties added yet.</p>
      ) : (
        properties.map((property: any, index: number) => (
          <div key={index} className="border rounded p-4">
            <h4 className="font-semibold">
              {property.title || "Untitled Property"}
            </h4>
            <p className="text-sm text-gray-600">
              {property.location || "No location"}
            </p>
            <div className="mt-2 flex gap-2">
              <button className="text-blue-600 hover:text-blue-800">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-800">
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PropertyEditor({ property, onSave, onCancel }: any) {
  const [data, setData] = useState(property);

  const handleSave = () => {
    onSave(data);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Property Title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={data.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Property description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={data.location || ""}
          onChange={(e) => setData({ ...data, location: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="City, State"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="text"
          value={data.price || ""}
          onChange={(e) => setData({ ...data, price: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="KES 500,000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Bedrooms</label>
        <input
          type="number"
          value={data.bedrooms || ""}
          onChange={(e) => setData({ ...data, bedrooms: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Bathrooms</label>
        <input
          type="number"
          value={data.bathrooms || ""}
          onChange={(e) => setData({ ...data, bathrooms: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Sqft</label>
        <input
          type="text"
          value={data.sqft || ""}
          onChange={(e) => setData({ ...data, sqft: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="2500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={data.status || "For Sale"}
          onChange={(e) => setData({ ...data, status: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="For Sale">For Sale</option>
          <option value="For Rent">For Rent</option>
          <option value="Sold">Sold</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Images</label>
        <textarea
          value={(data.images || []).join(",")}
          onChange={(e) =>
            setData({
              ...data,
              images: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
        <p className="text-sm text-gray-600 mt-1">
          Add image URLs separated by commas. For multiple images, add multiple
          URLs.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Property
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CategoriesEditor({ categories, onChange }: any) {
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (newCategory.trim()) {
      onChange([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="New category name"
        />
        <button
          onClick={addCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        {categories.map((category: string, index: number) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 border rounded"
          >
            <span>{category}</span>
            <button
              onClick={() => removeCategory(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Logo URL</label>
        <input
          type="url"
          value={data.url || ""}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/logo.png"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Alt Text</label>
        <input
          type="text"
          value={data.alt || ""}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Company Logo"
        />
      </div>
    </div>
  );
}

function ThemeEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Theme Style</label>
        <select
          value={data.style || "modern"}
          onChange={(e) => onChange({ ...data, style: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    </div>
  );
}

function ColorsEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Primary Color</label>
        <input
          type="color"
          value={data.primary || "#007bff"}
          onChange={(e) => onChange({ ...data, primary: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Secondary Color
        </label>
        <input
          type="color"
          value={data.secondary || "#6c757d"}
          onChange={(e) => onChange({ ...data, secondary: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Background Color
        </label>
        <input
          type="color"
          value={data.background || "#ffffff"}
          onChange={(e) => onChange({ ...data, background: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}

function FontsEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Heading Font</label>
        <select
          value={data.heading || "Inter"}
          onChange={(e) => onChange({ ...data, heading: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Body Font</label>
        <select
          value={data.body || "Inter"}
          onChange={(e) => onChange({ ...data, body: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
        </select>
      </div>
    </div>
  );
}

function SEOEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Page Title</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="My Website"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Meta Description
        </label>
        <textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Description of your website"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Keywords</label>
        <input
          type="text"
          value={data.keywords || ""}
          onChange={(e) => onChange({ ...data, keywords: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>
    </div>
  );
}

function DomainEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Custom Domain</label>
        <input
          type="text"
          value={data.domain || ""}
          onChange={(e) => onChange({ ...data, domain: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="www.example.com"
        />
      </div>
      <div className="text-sm text-gray-600">
        <p>Enter your custom domain to connect it to your website.</p>
        <p>You'll need to update your DNS settings to point to our servers.</p>
      </div>
    </div>
  );
}

function PublishEditor({ data, onChange }: any) {
  const [publishing, setPublishing] = React.useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const response = await fetch("/api/site/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: window.location.pathname.split("/")[3],
        }), // Extract siteId from URL
      });

      if (response.ok) {
        alert("Website published successfully!");
        // Optionally refresh the page or update state
        window.location.reload();
      } else {
        alert("Failed to publish website");
      }
    } catch (error) {
      alert("Error publishing website");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Ready to Publish
        </h3>
        <p className="text-green-700 mb-4">
          Your website is ready to go live! Click the button below to publish
          your changes. This will copy your draft content to the live website.
        </p>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Publish Website"}
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Publish Status</label>
        <div className="text-sm text-gray-600">
          {data.published ? "Published" : "Draft"}
        </div>
      </div>
    </div>
  );
}

function ContactInformationEditor({ data, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          WhatsApp Number
        </label>
        <input
          type="tel"
          value={data.whatsappNumber || ""}
          onChange={(e) =>
            onChange({ ...data, whatsappNumber: e.target.value })
          }
          className="w-full p-2 border rounded"
          placeholder="+1234567890"
        />
        <p className="text-sm text-gray-600 mt-1">
          Include country code (e.g., +1 for US, +254 for Kenya)
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input
          type="tel"
          value={data.phoneNumber || ""}
          onChange={(e) => onChange({ ...data, phoneNumber: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="+1234567890"
        />
        <p className="text-sm text-gray-600 mt-1">
          Primary phone number for calls
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="contact@example.com"
        />
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Floating Buttons</h4>
        <p className="text-blue-700 text-sm">
          These contact details will be used for floating WhatsApp and Call
          buttons on your public website. Only buttons with valid information
          will be displayed.
        </p>
      </div>
    </div>
  );
}

function FeaturedPropertiesEditor({ properties, featured, onChange }: any) {
  const handleToggleFeatured = (index: number) => {
    const isFeatured = featured.includes(index);
    if (isFeatured) {
      onChange(featured.filter((i: number) => i !== index));
    } else {
      onChange([...featured, index]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Select properties to feature on your homepage. These will be displayed
        prominently.
      </p>
      {properties.length === 0 ? (
        <p className="text-gray-500">
          No properties added yet. Add properties first to feature them.
        </p>
      ) : (
        <div className="space-y-2">
          {properties.map((property: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <h4 className="font-semibold">
                  {property.title || `Property ${index + 1}`}
                </h4>
                <p className="text-sm text-gray-600">
                  {property.location || "No location"}
                </p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={featured.includes(index)}
                  onChange={() => handleToggleFeatured(index)}
                  className="mr-2"
                />
                Feature
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
