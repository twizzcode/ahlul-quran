import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleNotification, type MidtransNotification } from "@/lib/midtrans";
import { apiSuccess, apiError } from "@/lib/utils";

// ============================================================
// POST /api/donations/notification - Midtrans Webhook
// ============================================================
// This endpoint receives payment notifications from Midtrans.
// Configure this URL in Midtrans Dashboard:
// https://masjidcontoh.com/api/donations/notification
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const notificationJson: MidtransNotification = await request.json();

    const { orderId, transactionId, status, paymentType } =
      await handleNotification(notificationJson);

    // Update donation in database
    const donation = await prisma.donation.update({
      where: { orderId },
      data: {
        midtransId: transactionId,
        status,
        paymentType,
        paidAt: status === "SUCCESS" ? new Date() : null,
      },
    });

    console.log(
      `[Midtrans] Order ${orderId}: ${status} via ${paymentType}`
    );

    return apiSuccess(donation, "Notification processed");
  } catch (error) {
    console.error("Error processing Midtrans notification:", error);
    return apiError("Failed to process notification", 500);
  }
}
