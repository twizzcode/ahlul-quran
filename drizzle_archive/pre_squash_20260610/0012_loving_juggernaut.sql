CREATE TYPE "public"."article_type" AS ENUM('berita', 'artikel');--> statement-breakpoint
ALTER TABLE "donation" DROP CONSTRAINT "donation_midtrans_id_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'JAMAAH'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('DEVELOPER', 'ADMIN', 'OWNER', 'JAMAAH');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'JAMAAH'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "article" ADD COLUMN "type" "article_type" DEFAULT 'artikel' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery" ADD COLUMN "donation_campaign_id" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "qris_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "qris_image_url" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "donation_bank_accounts" jsonb;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_donation_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("donation_campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_type_idx" ON "article" USING btree ("type");--> statement-breakpoint
ALTER TABLE "article" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN "midtrans_id";--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN "snap_token";--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN "snap_redirect_url";