import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const articleStatus = pgEnum("article_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const eventStatus = pgEnum("event_status", [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

export const donationStatus = pgEnum("donation_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "CHALLENGE",
  "CANCELED",
]);

export const financialType = pgEnum("financial_type", ["INCOME", "EXPENSE"]);

export const masjidProfile = pgTable("masjid_profile", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  tiktok: text("tiktok"),
  qrisEnabled: boolean("qris_enabled").default(true).notNull(),
  qrisImageUrl: text("qris_image_url"),
  donationBankAccounts: jsonb("donation_bank_accounts"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankHolder: text("bank_holder"),
  foundationName: text("foundation_name"),
  movementName: text("movement_name"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  homepageFeatureBadge: text("homepage_feature_badge"),
  homepageFeatureTitle: text("homepage_feature_title"),
  homepageFeatureDescription: text("homepage_feature_description"),
  homepageFeatureDonationEnabled: boolean("homepage_feature_donation_enabled")
    .default(true)
    .notNull(),
  homepageFeatureCampaignId: text("homepage_feature_campaign_id").references(
    () => donationCampaign.id,
    { onDelete: "set null" },
  ),
  homepageFeaturePrimaryButtonText: text("homepage_feature_primary_button_text"),
  homepageFeatureProfileButtonText: text("homepage_feature_profile_button_text"),
  homepageTestimonials: jsonb("homepage_testimonials"),
  homepageCtaTitle: text("homepage_cta_title"),
  homepageCtaDescription: text("homepage_cta_description"),
  homepageCtaButtonText: text("homepage_cta_button_text"),
  homepageCtaCards: jsonb("homepage_cta_cards"),
  backgroundText: text("background_text"),
  visionStatement: text("vision_statement"),
  visionItems: jsonb("vision_items"),
  timelineItems: jsonb("timeline_items"),
  committeeItems: jsonb("committee_items"),
  fundingItems: jsonb("funding_items"),
  roadmapItems: jsonb("roadmap_items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const articleCategory = pgTable("article_category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const donationCampaign = pgTable(
  "donation_campaign",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    coverImage: text("cover_image"),
    targetAmount: doublePrecision("target_amount").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("donation_campaign_slug_idx").on(table.slug)],
);

export const article = pgTable(
  "article",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    status: articleStatus("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id),
    categoryId: text("category_id").references(() => articleCategory.id),
    donationCampaignId: text("donation_campaign_id").references(
      () => donationCampaign.id,
      { onDelete: "set null" },
    ),
    tags: text("tags").array().default([]).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("article_slug_idx").on(table.slug),
    index("article_status_idx").on(table.status),
    index("article_donationCampaignId_idx").on(table.donationCampaignId),
  ],
);

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    coverImage: text("cover_image"),
    location: text("location"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    status: eventStatus("status").default("UPCOMING").notNull(),
    isRecurring: boolean("is_recurring").default(false).notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_slug_idx").on(table.slug),
    index("event_status_idx").on(table.status),
  ],
);

export const donation = pgTable(
  "donation",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().unique(),
    donorName: text("donor_name").notNull(),
    donorEmail: text("donor_email"),
    donorPhone: text("donor_phone"),
    amount: doublePrecision("amount").notNull(),
    message: text("message"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    status: donationStatus("status").default("PENDING").notNull(),
    paymentType: text("payment_type"),
    paidAt: timestamp("paid_at"),
    userId: text("user_id").references(() => user.id),
    campaignId: text("campaign_id").references(() => donationCampaign.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("donation_orderId_idx").on(table.orderId),
    index("donation_status_idx").on(table.status),
  ],
);

export const gallery = pgTable("gallery", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  donationCampaignId: text("donation_campaign_id").references(
    () => donationCampaign.id,
    { onDelete: "set null" },
  ),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const galleryImage = pgTable("gallery_image", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  caption: text("caption"),
  order: integer("order").default(0).notNull(),
  galleryId: text("gallery_id")
    .notNull()
    .references(() => gallery.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const financialRecord = pgTable(
  "financial_record",
  {
    id: text("id").primaryKey(),
    date: date("date").notNull(),
    description: text("description").notNull(),
    amount: doublePrecision("amount").notNull(),
    type: financialType("type").notNull(),
    category: text("category"),
    receiptUrl: text("receipt_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("financial_record_date_idx").on(table.date),
    index("financial_record_type_idx").on(table.type),
  ],
);

export const articleRelations = relations(article, ({ one }) => ({
  author: one(user, { fields: [article.authorId], references: [user.id] }),
  category: one(articleCategory, {
    fields: [article.categoryId],
    references: [articleCategory.id],
  }),
  donationCampaign: one(donationCampaign, {
    fields: [article.donationCampaignId],
    references: [donationCampaign.id],
  }),
}));

export const donationRelations = relations(donation, ({ one }) => ({
  user: one(user, { fields: [donation.userId], references: [user.id] }),
  campaign: one(donationCampaign, {
    fields: [donation.campaignId],
    references: [donationCampaign.id],
  }),
}));

export const donationCampaignRelations = relations(
  donationCampaign,
  ({ many }) => ({
    donations: many(donation),
    updates: many(article),
    galleries: many(gallery),
  }),
);

export const galleryRelations = relations(gallery, ({ one, many }) => ({
  author: one(user, { fields: [gallery.authorId], references: [user.id] }),
  campaign: one(donationCampaign, {
    fields: [gallery.donationCampaignId],
    references: [donationCampaign.id],
  }),
  images: many(galleryImage),
}));

export const galleryImageRelations = relations(galleryImage, ({ one }) => ({
  gallery: one(gallery, {
    fields: [galleryImage.galleryId],
    references: [gallery.id],
  }),
}));
