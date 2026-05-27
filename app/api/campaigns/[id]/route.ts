import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { article, donation, donationCampaign } from "@/src/db/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const targetAmount = Number(payload.targetAmount);

  if (title.length < 3 || description.length < 10 || !Number.isFinite(targetAmount) || targetAmount < 100000) {
    return apiError("Data kampanye tidak valid.", 400);
  }

  const [updated] = await db.update(donationCampaign).set({
    title,
    description,
    coverImage: payload.coverImage ? String(payload.coverImage).trim() : null,
    targetAmount,
    isActive: payload.isActive !== false,
    endDate: payload.endDate ? new Date(String(payload.endDate)) : null,
    updatedAt: new Date(),
  }).where(eq(donationCampaign.id, id)).returning();

  if (!updated) {
    return apiError("Kampanye tidak ditemukan.", 404);
  }

  return apiSuccess(updated, "Kampanye berhasil diperbarui.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;

  await db.update(article).set({ donationCampaignId: null }).where(eq(article.donationCampaignId, id));
  await db.update(donation).set({ campaignId: null }).where(eq(donation.campaignId, id));
  const [deleted] = await db.delete(donationCampaign).where(eq(donationCampaign.id, id)).returning({ id: donationCampaign.id });

  if (!deleted) {
    return apiError("Kampanye tidak ditemukan.", 404);
  }

  return apiSuccess({ id }, "Kampanye berhasil dihapus.");
}
