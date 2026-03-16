import prisma from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/utils";

function isManualBsiTransfer(paymentType: string | null) {
  return (paymentType ?? "").toLowerCase().includes("bsi");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentType: true,
        campaignId: true,
      },
    });

    if (!donation) {
      return apiError("Donasi tidak ditemukan.", 404);
    }

    if (!isManualBsiTransfer(donation.paymentType)) {
      return apiError("Approve manual hanya berlaku untuk transfer Bank BSI.", 400);
    }

    if (donation.status !== "PENDING") {
      return apiError("Hanya donasi pending yang bisa di-approve.", 400);
    }

    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
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

    return apiSuccess(updatedDonation, "Donasi transfer BSI berhasil di-approve.");
  } catch (error) {
    console.error("Error approving manual bank donation:", error);
    return apiError("Gagal meng-approve donasi transfer bank.", 500);
  }
}
