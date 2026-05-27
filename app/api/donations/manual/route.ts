import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { donation, donationCampaign } from "@/src/db/schema";

export async function POST(request: Request) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const payload = await request.json();
  const amount = Number(payload.amount);
  const isAnonymous = Boolean(payload.isAnonymous);
  const donorName = isAnonymous ? "Hamba Allah" : String(payload.donorName ?? "").trim();

  if ((!isAnonymous && donorName.length < 2) || !Number.isFinite(amount) || amount < 10000) {
    return apiError("Data donasi manual tidak valid.", 400);
  }

  const [created] = await db.insert(donation).values({
    id: crypto.randomUUID(),
    orderId: `MANUAL-${Date.now()}`,
    donorName,
    donorEmail: payload.donorEmail ? String(payload.donorEmail).trim() : null,
    donorPhone: payload.donorPhone ? String(payload.donorPhone).trim() : null,
    amount,
    message: payload.message ? String(payload.message).trim() : null,
    isAnonymous,
    status: "SUCCESS",
    paymentType: "manual_bsi_transfer",
    paidAt: new Date(),
    userId: context.user.id,
    campaignId: payload.campaignId ? String(payload.campaignId).trim() : null,
  }).returning();

  const campaign = created.campaignId
    ? await db.query.donationCampaign.findFirst({ where: eq(donationCampaign.id, created.campaignId), columns: { id: true, title: true } })
    : null;

  return apiSuccess({
    ...created,
    createdAt: created.createdAt.toISOString(),
    campaign,
  }, "Donasi manual berhasil ditambahkan.");
}
