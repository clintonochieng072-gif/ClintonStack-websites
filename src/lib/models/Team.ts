import mongoose, { Document, Model } from "mongoose";

export interface ITeamMember extends Document {
  siteId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
  permissions: {
    canEditContent: boolean;
    canPublish: boolean;
    canManageProperties: boolean;
    canViewAnalytics: boolean;
    canManageTeam: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new mongoose.Schema<ITeamMember>(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    joinedAt: {
      type: Date,
    },
    lastActiveAt: {
      type: Date,
    },
    permissions: {
      canEditContent: { type: Boolean, default: false },
      canPublish: { type: Boolean, default: false },
      canManageProperties: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: false },
      canManageTeam: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
TeamMemberSchema.index({ siteId: 1, email: 1 }, { unique: true });
TeamMemberSchema.index({ userId: 1 });
TeamMemberSchema.index({ status: 1 });

const TeamMember: Model<ITeamMember> =
  (mongoose.models && mongoose.models.TeamMember) ||
  mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

export default TeamMember;
