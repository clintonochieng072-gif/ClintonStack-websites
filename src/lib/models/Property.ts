import mongoose, { Document, Model } from "mongoose";

export interface IProperty extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  features: string[];
  category: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  isPublished: boolean;
  paid: boolean;
  planType?: "monthly" | "one_time";
  paymentExpiresAt?: Date;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new mongoose.Schema<IProperty>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    images: [{ type: String }],
    features: [{ type: String }],
    category: { type: String, required: true },
    propertyType: { type: String, required: true },
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    isPublished: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
    planType: { type: String, enum: ["monthly", "one_time"] },
    paymentExpiresAt: Date,
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
PropertySchema.index({ userId: 1, isPublished: 1 });
PropertySchema.index({ category: 1, isPublished: 1 });
PropertySchema.index({ slug: 1 });

const Property: Model<IProperty> =
  mongoose.models.Property ||
  mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
