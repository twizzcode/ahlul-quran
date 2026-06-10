CREATE TYPE "public"."user_role" AS ENUM('DEVELOPER', 'ADMIN', 'OWNER', 'JAMAAH');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."article_type" AS ENUM('berita', 'artikel');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CHALLENGE', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."financial_type" AS ENUM('INCOME', 'EXPENSE');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'JAMAAH' NOT NULL,
	"phone" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image" text,
	"type" "article_type" DEFAULT 'artikel' NOT NULL,
	"status" "article_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"author_id" text NOT NULL,
	"category_id" text,
	"donation_campaign_id" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "article_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "article_category_name_unique" UNIQUE("name"),
	CONSTRAINT "article_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"donor_name" text NOT NULL,
	"donor_email" text,
	"donor_phone" text,
	"amount" double precision NOT NULL,
	"message" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"status" "donation_status" DEFAULT 'PENDING' NOT NULL,
	"payment_type" text,
	"bank_name" text,
	"bank_account" text,
	"bank_holder" text,
	"paid_at" timestamp,
	"user_id" text,
	"campaign_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "donation_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "donation_campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"cover_image" text,
	"target_amount" double precision NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "donation_campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"cover_image" text,
	"location" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" "event_status" DEFAULT 'UPCOMING' NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "financial_record" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"amount" double precision NOT NULL,
	"type" "financial_type" NOT NULL,
	"category" text,
	"receipt_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"donation_campaign_id" text,
	"author_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_image" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"order" integer DEFAULT 0 NOT NULL,
	"gallery_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "masjid_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postal_code" text,
	"phone" text,
	"email" text,
	"website" text,
	"latitude" double precision,
	"longitude" double precision,
	"logo_url" text,
	"banner_url" text,
	"facebook" text,
	"instagram" text,
	"youtube" text,
	"tiktok" text,
	"qris_enabled" boolean DEFAULT true NOT NULL,
	"qris_image_url" text,
	"qris_icon_url" text,
	"qris_holder_name" text,
	"donation_bank_accounts" jsonb,
	"bank_name" text,
	"bank_account" text,
	"bank_holder" text,
	"foundation_name" text,
	"movement_name" text,
	"hero_title" text,
	"hero_subtitle" text,
	"homepage_feature_badge" text,
	"homepage_feature_title" text,
	"homepage_feature_description" text,
	"homepage_feature_donation_enabled" boolean DEFAULT true NOT NULL,
	"homepage_feature_campaign_id" text,
	"homepage_feature_primary_button_text" text,
	"homepage_feature_profile_button_text" text,
	"homepage_testimonials" jsonb,
	"homepage_cta_title" text,
	"homepage_cta_description" text,
	"homepage_cta_button_text" text,
	"homepage_cta_cards" jsonb,
	"background_text" text,
	"vision_statement" text,
	"vision_items" jsonb,
	"timeline_items" jsonb,
	"committee_items" jsonb,
	"funding_items" jsonb,
	"roadmap_items" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_category_id_article_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_donation_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("donation_campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_donation_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("donation_campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_image" ADD CONSTRAINT "gallery_image_gallery_id_gallery_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD CONSTRAINT "masjid_profile_homepage_feature_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("homepage_feature_campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "article_slug_idx" ON "article" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_type_idx" ON "article" USING btree ("type");--> statement-breakpoint
CREATE INDEX "article_status_idx" ON "article" USING btree ("status");--> statement-breakpoint
CREATE INDEX "article_donationCampaignId_idx" ON "article" USING btree ("donation_campaign_id");--> statement-breakpoint
CREATE INDEX "donation_orderId_idx" ON "donation" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "donation_status_idx" ON "donation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "donation_campaign_slug_idx" ON "donation_campaign" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_slug_idx" ON "event" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "financial_record_date_idx" ON "financial_record" USING btree ("date");--> statement-breakpoint
CREATE INDEX "financial_record_type_idx" ON "financial_record" USING btree ("type");