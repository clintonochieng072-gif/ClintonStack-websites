import { z } from "zod";

// Auth schemas
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

export const updateProfileSchema = z.object({
  category: z.string().optional(),
  niche: z.string().optional(),
  template: z.string().optional(),
  onboarded: z.boolean().optional(),
  avatarUrl: z.string().url().optional(),
  trialEndsAt: z.string().datetime().optional(),
});

// User schemas
export const updateOnboardingSchema = z.object({
  category: z.string().min(1, "Category is required"),
  niche: z.string().min(1, "Niche is required"),
  template: z.string().min(1, "Template is required"),
});

// Portfolio schemas
export const contactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
  facebook: z.string().url().optional(),
});

export const skillSchema = z.string().min(1).max(50);

export const projectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  image: z.string().url().optional(),
  link: z.string().url().optional(),
  technologies: z.array(z.string()).optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  position: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  price: z.number().min(0).optional(),
  currency: z.string().max(3).optional(),
});

export const galleryItemSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional(),
  caption: z.string().max(200).optional(),
});

export const portfolioUpdateSchema = z.object({
  contacts: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(contactSchema.optional()),
  skills: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(z.array(skillSchema).optional()),
  projects: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(z.array(projectSchema).optional()),
  testimonials: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(z.array(testimonialSchema).optional()),
  displayName: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  isPublished: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  category: z.string().max(50).optional(),
  niche: z.string().max(50).optional(),
  selectedTemplate: z.string().max(50).optional(),
  services: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(z.array(serviceSchema).optional()),
  gallery: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(z.array(galleryItemSchema).optional()),
  themeColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  heroImage: z.string().url().optional(),
  sections: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : undefined))
    .pipe(z.record(z.string(), z.unknown()).optional()),
  resumeUrl: z.string().url().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateOnboardingInput = z.infer<typeof updateOnboardingSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;
