import mongoose, { Document, Model } from "mongoose";

export interface IPlan extends Document {
  name: string; // Plan name (Starter, Standard, Premium, Elite)
  slug: string; // URL-friendly identifier
  price: number; // Monthly price in KES
  currency: string; // Currency code (KES)
  baseStorage: number; // Base storage in GB
  maxImages: number; // Max images per month
  features: string[]; // Array of feature descriptions
  extraStoragePrice: number; // Price per GB for extra storage
  isActive: boolean; // Whether plan is available
  sortOrder: number; // Display order
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new mongoose.Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "KES",
    },
    baseStorage: {
      type: Number,
      required: true,
      min: 0,
    },
    maxImages: {
      type: Number,
      required: true,
      min: 0,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    extraStoragePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Plan: Model<IPlan> =
  (mongoose.models && mongoose.models.Plan) ||
  mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;
