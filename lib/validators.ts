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
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  campaignId: z.string().optional(),
  paymentMethod: z.enum(["QRIS", "BSI_TRANSFER"]).default("QRIS"),
});

export const createManualDonationSchema = z.object({
  donorName: z.string().trim().optional(),
  donorEmail: z.string().email("Email tidak valid").optional(),
  donorPhone: z.string().optional(),
  amount: z.number().min(10000, "Minimal donasi Rp 10.000"),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  campaignId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.isAnonymous && (!data.donorName || data.donorName.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["donorName"],
      message: "Nama minimal 2 karakter",
    });
  }
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
  images: z
    .array(
      z.object({
        url: z.string().url("URL gambar tidak valid"),
        caption: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 gambar")
    .max(1, "Galeri hanya mendukung 1 gambar per item"),
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

export const updateMasjidProfileSchema = z.object({
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
});
