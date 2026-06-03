import { eq } from "drizzle-orm";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { donation } from "@/src/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = id?.trim();

  if (!orderId) {
    return apiError("Order ID tidak valid.", 400);
  }

  const [record, profile] = await Promise.all([
    db.query.donation.findFirst({
      where: eq(donation.orderId, orderId),
    }),
    getMasjidProfileData(),
  ]);

  if (!record) {
    return apiError("Status donasi tidak ditemukan.", 404);
  }

  return apiSuccess({
    donation: {
      orderId: record.orderId,
      amount: record.amount,
      status: record.status,
      paymentType: record.paymentType,
      createdAt: record.createdAt.toISOString(),
      paidAt: record.paidAt ? record.paidAt.toISOString() : null,
      donorName: record.donorName,
      qrisImageUrl: profile.qrisImageUrl || null,
    },
  });
}
