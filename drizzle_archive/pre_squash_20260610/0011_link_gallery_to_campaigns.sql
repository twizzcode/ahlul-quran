ALTER TABLE "gallery" ADD COLUMN "donation_campaign_id" text;
--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_donation_campaign_id_donation_campaign_id_fk" FOREIGN KEY ("donation_campaign_id") REFERENCES "public"."donation_campaign"("id") ON DELETE set null ON UPDATE no action;
