ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_badge" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_title" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_description" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_donation_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_campaign_id" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_primary_button_text" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD COLUMN "homepage_feature_profile_button_text" text;--> statement-breakpoint
ALTER TABLE "masjid_profile" ADD CONSTRAINT "masjid_profile_homepage_feature_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("homepage_feature_campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE set null ON UPDATE no action;