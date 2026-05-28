ALTER TABLE "donation" DROP CONSTRAINT IF EXISTS "donation_midtrans_id_unique";
ALTER TABLE "donation" DROP COLUMN IF EXISTS "midtrans_id";
ALTER TABLE "donation" DROP COLUMN IF EXISTS "snap_token";
ALTER TABLE "donation" DROP COLUMN IF EXISTS "snap_redirect_url";
