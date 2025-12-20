import mongoose, { Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  slug: string; // URL-friendly identifier
  status: "active" | "inactive";
  commissionRate: number; // Commission per referral (e.g., 500 for KES 500)
  features?: string[]; // Key features of the product
  pricing?: {
    type: "monthly" | "lifetime" | "one_time";
    amount: number;
    currency: string;
  }[];
  isActive: boolean; // Whether affiliates can promote this product
  sortOrder?: number; // Order for displaying products
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
  },
  features: [
    {
      type: String,
      trim: true,
    },
  ],
  pricing: [
    {
      type: {
        type: String,
        enum: ["monthly", "lifetime", "one_time"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "KES",
      },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ProductSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Product: Model<IProduct> =
  (mongoose.models && mongoose.models.Product) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
