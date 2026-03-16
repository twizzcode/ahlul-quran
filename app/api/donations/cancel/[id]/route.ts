import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isDashboardRole } from "@/lib/user-roles";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headerStore = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headerStore),
    });

    if (!session?.user || !isDashboardRole(session.user.role)) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!donation) {
      return apiError("Donasi tidak ditemukan.", 404);
    }

    if (donation.status !== "PENDING") {
      return apiError("Hanya donasi pending yang bisa dibatalkan.", 400);
    }

    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        status: "CANCELED",
        paidAt: null,
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

    return apiSuccess(updatedDonation, "Donasi berhasil dibatalkan.");
  } catch (error) {
    console.error("Error canceling donation:", error);
    return apiError("Gagal membatalkan donasi.", 500);
  }
}
