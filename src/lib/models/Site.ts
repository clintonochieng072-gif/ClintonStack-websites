// src/lib/models/Site.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISite extends Document {
  ownerId: string;
  slug: string;
  niche: string | null;
  title?: string;
  published?: boolean;
  userWebsite: {
    draft: { [key: string]: any }; // Draft content - always updated when admin saves
    published: { [key: string]: any }; // Published content - only updated when published
    integrations: {
      phoneNumber?: string;
      whatsappNumber?: string;
      tawkToId?: string;
      crispId?: string;
      googleAnalyticsId?: string;
      googleTagManagerId?: string;
      metaPixelId?: string;
      mailchimpApiKey?: string;
      mailchimpListId?: string;
      brevoApiKey?: string;
      googleMapsApiKey?: string;
      customScript?: string;
    };
  };
  layout: string | null;
  theme?: { primary?: string; accent?: string; font?: string };
  propertyTypes?: Schema.Types.ObjectId[];
  publishSchedule?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    lastPublished?: Date;
    nextPublish?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SiteSchema = new Schema<ISite>(
  {
    ownerId: { type: String, required: true },
    slug: { type: String, required: true, index: true, unique: true },
    niche: { type: String, default: null },
    title: { type: String },
    published: { type: Boolean, default: false },
    userWebsite: {
      draft: { type: Schema.Types.Mixed, default: {} },
      published: { type: Schema.Types.Mixed, default: {} },
      integrations: {
        phoneNumber: { type: String, default: "" },
        whatsappNumber: { type: String, default: "" },
        tawkToId: { type: String, default: "" },
        crispId: { type: String, default: "" },
        googleAnalyticsId: { type: String, default: "" },
        googleTagManagerId: { type: String, default: "" },
        metaPixelId: { type: String, default: "" },
        mailchimpApiKey: { type: String, default: "" },
        mailchimpListId: { type: String, default: "" },
        brevoApiKey: { type: String, default: "" },
        googleMapsApiKey: { type: String, default: "" },
        customScript: { type: String, default: "" },
      },
    },
    layout: { type: String, default: null },
    theme: { type: Schema.Types.Mixed, default: {} },
    propertyTypes: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    publishSchedule: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
      },
      time: { type: String, default: "09:00" },
      dayOfWeek: { type: Number, min: 0, max: 6 },
      dayOfMonth: { type: Number, min: 1, max: 31 },
      lastPublished: { type: Date },
      nextPublish: { type: Date },
    },
  },
  { timestamps: true }
);

export const Site =
  mongoose.models.Site || mongoose.model<ISite>("Site", SiteSchema);
