import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isDashboardRole } from "@/lib/user-roles";
import { apiError, apiSuccess } from "@/lib/utils";
import { createManualDonationSchema } from "@/lib/validators";
import { generateOrderId } from "@/lib/midtrans";

export async function POST(request: Request) {
  try {
    const headerStore = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headerStore),
    });

    if (!session?.user || !isDashboardRole(session.user.role)) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const validated = createManualDonationSchema.parse(body);
    const orderId = generateOrderId("ADM");

    const donation = await prisma.donation.create({
      data: {
        orderId,
        donorName: validated.donorName,
        donorEmail: validated.donorEmail,
        donorPhone: validated.donorPhone,
        amount: validated.amount,
        type: validated.type,
        message: validated.message,
        isAnonymous: validated.isAnonymous,
        status: "SUCCESS",
        paymentType: "Transfer Manual Admin",
        paidAt: new Date(),
        campaignId: validated.campaignId || null,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return apiSuccess(donation, "Donasi manual berhasil ditambahkan.");
  } catch (error) {
    console.error("Error creating manual donation:", error);
    if (error instanceof Error) {
      return apiError(error.message, 500);
    }
    return apiError("Gagal menambahkan donasi manual.", 500);
  }
}
