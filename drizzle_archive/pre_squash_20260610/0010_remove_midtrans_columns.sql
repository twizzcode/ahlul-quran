ALTER TABLE "donation" DROP CONSTRAINT IF EXISTS "donation_midtrans_id_unique";
--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN IF EXISTS "midtrans_id";
--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN IF EXISTS "snap_token";
--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN IF EXISTS "snap_redirect_url";
