import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { updateManualDonationSchema } from "@/lib/validation/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { donation, donationCampaign } from "@/src/db/schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const payload = await request.json();
  const parsed = updateManualDonationSchema.safeParse({
    donorName: payload.donorName ? String(payload.donorName).trim() : undefined,
    donorEmail: payload.donorEmail ? String(payload.donorEmail).trim() : undefined,
    donorPhone: payload.donorPhone ? String(payload.donorPhone).trim() : undefined,
    amount: Number(payload.amount),
    message: payload.message ? String(payload.message).trim() : undefined,
    isAnonymous: Boolean(payload.isAnonymous),
    campaignId: payload.campaignId ? String(payload.campaignId).trim() : undefined,
  });

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "Data donasi tidak valid.", 400);
  }

  const values = parsed.data;
  const campaignId = values.campaignId?.trim() ? values.campaignId.trim() : null;

  if (campaignId) {
    const campaign = await db.query.donationCampaign.findFirst({
      where: eq(donationCampaign.id, campaignId),
      columns: { id: true, title: true },
    });

    if (!campaign) {
      return apiError("Kampanye donasi tidak ditemukan.", 404);
    }
  }

  const [updated] = await db
    .update(donation)
    .set({
      donorName: values.isAnonymous ? "Hamba Allah" : values.donorName!.trim(),
      donorEmail: values.donorEmail?.trim() || null,
      donorPhone: values.donorPhone?.trim() || null,
      amount: values.amount,
      message: values.message?.trim() || null,
      isAnonymous: values.isAnonymous,
      campaignId,
      updatedAt: new Date(),
      userId: context.user.id,
    })
    .where(eq(donation.id, id))
    .returning();

  if (!updated) {
    return apiError("Donasi tidak ditemukan.", 404);
  }

  const campaign = updated.campaignId
    ? await db.query.donationCampaign.findFirst({
        where: eq(donationCampaign.id, updated.campaignId),
        columns: { id: true, title: true },
      })
    : null;

  return apiSuccess(
    {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      campaign,
    },
    "Donasi berhasil diperbarui."
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const [deleted] = await db
    .delete(donation)
    .where(eq(donation.id, id))
    .returning({ id: donation.id });

  if (!deleted) {
    return apiError("Donasi tidak ditemukan.", 404);
  }

  return apiSuccess({ id }, "Donasi berhasil dihapus.");
}
