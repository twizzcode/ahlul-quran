import { z } from "zod";

// ============================================================
// Article Validators
// ============================================================

export const createArticleSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(10, "Konten minimal 10 karakter"),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().optional(),
  donationCampaignId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateArticleSchema = createArticleSchema.partial();

// ============================================================
// Event Validators
// ============================================================

export const createEventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  coverImage: z.string().url().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
  isRecurring: z.boolean().default(false),
});

export const updateEventSchema = createEventSchema.partial();

// ============================================================
// Donation Validators
// ============================================================

export const createDonationSchema = z.object({
  donorName: z.string().min(2, "Nama minimal 2 karakter"),
  donorEmail: z.string().email("Email tidak valid").optional(),
  donorPhone: z.string().optional(),
  amount: z.number().min(10000, "Minimal donasi Rp 10.000"),
  type: z.enum(["INFAQ", "SEDEKAH", "ZAKAT", "WAKAF", "PEMBANGUNAN", "OPERASIONAL", "OTHER"]),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  campaignId: z.string().optional(),
  paymentMethod: z.enum(["QRIS", "BSI_TRANSFER"]).default("QRIS"),
});

export const createManualDonationSchema = z.object({
  donorName: z.string().min(2, "Nama minimal 2 karakter"),
  donorEmail: z.string().email("Email tidak valid").optional(),
  donorPhone: z.string().optional(),
  amount: z.number().min(10000, "Minimal donasi Rp 10.000"),
  type: z.enum(["INFAQ", "SEDEKAH", "ZAKAT", "WAKAF", "PEMBANGUNAN", "OPERASIONAL", "OTHER"]),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  campaignId: z.string().optional(),
});

// ============================================================
// Campaign Validators
// ============================================================

export const createCampaignSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  coverImage: z.string().url().optional(),
  targetAmount: z.number().min(100000, "Target minimal Rp 100.000"),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  linkedArticleIds: z.array(z.string().min(1)).max(20).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

// ============================================================
// Gallery Validators
// ============================================================

export const createGallerySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
});

export const updateGallerySchema = createGallerySchema.partial();

export const addGalleryImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  order: z.number().default(0),
});

// ============================================================
// Masjid Profile Validators
// ============================================================

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim();
}, z.string().optional());

const optionalEmail = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim();
}, z.union([z.string().email(), z.literal("")]).optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim();
}, z.union([z.string().url(), z.literal("")]).optional());

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}, z.number().optional());

const visionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const timelineItemSchema = z.object({
  period: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const committeeItemSchema = z.object({
  section: z.string().min(1),
  leads: z.string().min(1),
  bullets: z.array(z.string().min(1)),
});

const fundingItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const roadmapItemSchema = z.object({
  phase: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const updateMasjidProfileSchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: optionalText,
  address: optionalText,
  city: optionalText,
  province: optionalText,
  postalCode: optionalText,
  phone: optionalText,
  email: optionalEmail,
  website: optionalUrl,
  latitude: optionalNumber,
  longitude: optionalNumber,
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  facebook: optionalText,
  instagram: optionalText,
  youtube: optionalText,
  tiktok: optionalText,
  bankName: optionalText,
  bankAccount: optionalText,
  bankHolder: optionalText,
  foundationName: optionalText,
  movementName: optionalText,
  heroTitle: optionalText,
  heroSubtitle: optionalText,
  backgroundText: optionalText,
  visionStatement: optionalText,
  visionItems: z.array(visionItemSchema).optional(),
  timelineItems: z.array(timelineItemSchema).optional(),
  committeeItems: z.array(committeeItemSchema).optional(),
  fundingItems: z.array(fundingItemSchema).optional(),
  roadmapItems: z.array(roadmapItemSchema).optional(),
});
