import mongoose, { Document, Model } from "mongoose";

export interface IAnalytics extends Document {
  siteId: mongoose.Types.ObjectId;
  visitorId: string; // Unique identifier for visitor (could be IP + user agent hash)
  sessionId: string; // Session identifier
  page: string; // Page URL
  referrer?: string; // Referring URL
  userAgent?: string; // Browser user agent
  deviceType: "desktop" | "mobile" | "tablet";
  country?: string;
  city?: string;
  pageViews: number; // Number of page views in this session
  sessionDuration?: number; // Session duration in seconds
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new mongoose.Schema<IAnalytics>(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    visitorId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      required: true,
    },
    referrer: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    pageViews: {
      type: Number,
      default: 1,
    },
    sessionDuration: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
AnalyticsSchema.index({ siteId: 1, timestamp: -1 });
AnalyticsSchema.index({ visitorId: 1 });
AnalyticsSchema.index({ sessionId: 1 });
AnalyticsSchema.index({ page: 1 });

const Analytics: Model<IAnalytics> =
  (mongoose.models && mongoose.models.Analytics) ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
