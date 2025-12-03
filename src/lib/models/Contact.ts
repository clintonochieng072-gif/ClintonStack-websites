import mongoose, { Document, Model } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  siteSlug: string;
  siteId?: mongoose.Types.ObjectId;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string; // "contact_form", "whatsapp", etc.
  notes?: string;
  assignedTo?: mongoose.Types.ObjectId; // User ID
  followUpDate?: Date;
  tags: string[];
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    pageUrl?: string;
  };
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new mongoose.Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    siteSlug: {
      type: String,
      required: true,
    },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
    },
    source: {
      type: String,
      default: "contact_form",
    },
    notes: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    followUpDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
      pageUrl: String,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ContactSchema.index({ siteId: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ assignedTo: 1 });

const Contact: Model<IContact> =
  (mongoose.models && mongoose.models.Contact) ||
  mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
