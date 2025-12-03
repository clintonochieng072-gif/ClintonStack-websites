"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Building,
  Image,
  Palette,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Tag,
  Camera,
  Globe,
  Search,
  Upload,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "website-sections",
    name: "Website Sections",
    icon: Home,
    children: [
      { id: "homepage", name: "Homepage", icon: Home },
      { id: "hero", name: "Hero", icon: Home },
      {
        id: "featured-properties",
        name: "Featured Properties",
        icon: Building,
      },
      { id: "services", name: "Services", icon: Home },
      { id: "testimonials", name: "Testimonials", icon: Home },
      { id: "cta", name: "Call to Action", icon: Home },
      { id: "about", name: "About", icon: Home },
      { id: "contact", name: "Contact", icon: Home },
    ],
  },
  {
    id: "properties",
    name: "Properties",
    icon: Building,
    children: [
      { id: "all-properties", name: "All Properties", icon: List },
      { id: "add-property", name: "Add Property", icon: Plus },
      { id: "categories", name: "Categories", icon: Tag },
    ],
  },
  {
    id: "media",
    name: "Media",
    icon: Image,
    children: [
      { id: "property-gallery", name: "Property Gallery", icon: Camera },
      { id: "website-gallery", name: "Website Gallery", icon: Image },
    ],
  },
  {
    id: "design",
    name: "Design",
    icon: Palette,
    children: [
      { id: "logo", name: "Logo", icon: Image },
      { id: "theme", name: "Theme", icon: Palette },
      { id: "colors", name: "Colors", icon: Palette },
      { id: "fonts", name: "Fonts", icon: Palette },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    children: [
      {
        id: "contact-information",
        name: "Contact Information",
        icon: Settings,
      },
      { id: "seo", name: "SEO", icon: Search },
      { id: "domain", name: "Domain", icon: Globe },
      { id: "publish", name: "Publish Website", icon: Upload },
    ],
  },
];

interface EditorSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  expandedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
}

export default function EditorSidebar({
  activeSection,
  onSectionChange,
  expandedSections,
  onToggleSection,
}: EditorSidebarProps) {
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              onToggleSection(item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
          className={cn(
            "w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors hover:bg-gray-100",
            level > 0 && "ml-4",
            isActive && "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
          )}
        >
          <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{item.name}</span>
          {hasChildren && (
            <div className="ml-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Site Editor</h2>
      </div>
      <nav className="p-2">{menuItems.map((item) => renderMenuItem(item))}</nav>
    </div>
  );
}
