import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTransactionStatus, mapMidtransTransactionStatus } from "@/lib/midtrans";
import { apiSuccess, apiError } from "@/lib/utils";

// ============================================================
// GET /api/donations/[orderId]/status - Check donation status
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    let donation = await prisma.donation.findUnique({
      where: { orderId },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    if (!donation) {
      return apiError("Donasi tidak ditemukan", 404);
    }

    // Also check Midtrans for latest status
    let midtransStatus: {
      transaction_id?: string;
      transaction_status?: string;
      fraud_status?: string;
      payment_type?: string;
    } | null = null;

    try {
      midtransStatus = await getTransactionStatus(orderId);

      const latestStatus = mapMidtransTransactionStatus(
        midtransStatus.transaction_status || "",
        midtransStatus.fraud_status
      );
      const latestPaymentType = midtransStatus.payment_type || null;
      const latestMidtransId = midtransStatus.transaction_id || null;

      const shouldUpdate =
        donation.status !== latestStatus ||
        donation.paymentType !== latestPaymentType ||
        donation.midtransId !== latestMidtransId ||
        (latestStatus === "SUCCESS" && !donation.paidAt);

      if (shouldUpdate) {
        donation = await prisma.donation.update({
          where: { id: donation.id },
          include: {
            campaign: { select: { id: true, title: true } },
          },
          data: {
            status: latestStatus,
            paymentType: latestPaymentType,
            midtransId: latestMidtransId,
            paidAt:
              latestStatus === "SUCCESS"
                ? donation.paidAt ?? new Date()
                : donation.paidAt,
          },
        });
      }
    } catch {
      // Transaction might not exist yet in Midtrans
    }

    return apiSuccess({
      donation: {
        ...donation,
        donorName: donation.isAnonymous ? "Hamba Allah" : donation.donorName,
      },
      midtransStatus,
    });
  } catch (error) {
    console.error("Error fetching donation status:", error);
    return apiError("Gagal mengambil status donasi", 500);
  }
}
