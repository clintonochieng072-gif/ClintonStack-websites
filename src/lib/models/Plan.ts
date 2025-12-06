import mongoose, { Document, Model } from "mongoose";

export interface IPlan extends Document {
  name: string; // Plan name (Basic, Lifetime)
  slug: string; // URL-friendly identifier
  price: number; // Monthly price in KES
  currency: string; // Currency code (KES)
  features: string[]; // Array of feature descriptions
  isActive: boolean; // Whether plan is available
  sortOrder: number; // Display order
  type: "subscription" | "one_time"; // Plan type
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
    features: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["subscription", "one_time"],
      default: "subscription",
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
