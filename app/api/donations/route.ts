import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createQrisTransaction, generateOrderId } from "@/lib/midtrans";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";
import { getManualBankTransferDetails } from "@/lib/manual-bank-transfer";
import { apiSuccess, apiError, apiPaginated } from "@/lib/utils";
import { createDonationSchema } from "@/lib/validators";

// ============================================================
// GET /api/donations - List donations (public: only success)
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "SUCCESS";
    const campaignId = searchParams.get("campaignId");
    const all = searchParams.get("all"); // admin: show all statuses

    const where: Record<string, unknown> = {};

    if (all !== "true") {
      where.status = status;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          campaign: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    // Hide donor info for anonymous donations
    const sanitized = donations.map((d) => ({
      ...d,
      donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
      donorEmail: d.isAnonymous ? null : d.donorEmail,
      donorPhone: d.isAnonymous ? null : d.donorPhone,
    }));

    return apiPaginated(sanitized, total, page, limit);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return apiError("Gagal mengambil data donasi", 500);
  }
}

// ============================================================
// POST /api/donations - Create donation & get Midtrans snap token
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createDonationSchema.parse(body);
    const orderId = generateOrderId("DON");
    const donationType =
      validated.type as
        | "INFAQ"
        | "SEDEKAH"
        | "ZAKAT"
        | "WAKAF"
        | "PEMBANGUNAN"
        | "OPERASIONAL"
        | "OTHER";

    if (validated.paymentMethod === "BSI_TRANSFER") {
      const profile = await getMasjidProfileData();
      const manualTransfer = getManualBankTransferDetails(profile);

      const redirectUrl = `/donasi/status?order_id=${orderId}`;
      const donation = await prisma.donation.create({
        data: {
          orderId,
          donorName: validated.donorName,
          donorEmail: validated.donorEmail,
          donorPhone: validated.donorPhone,
          amount: validated.amount,
          type: donationType,
          message: validated.message,
          isAnonymous: validated.isAnonymous,
          paymentType: "Transfer Bank BSI",
          snapRedirectUrl: redirectUrl,
          campaignId: validated.campaignId,
          userId: body.userId || null,
        },
      });

      return apiSuccess(
        {
          donation,
          redirectUrl,
          manualTransfer,
        },
        "Instruksi transfer bank berhasil dibuat"
      );
    }

    const redirectUrl = `/donasi/status?order_id=${orderId}`;
    const qrisTransaction = await createQrisTransaction({
      orderId,
      amount: validated.amount,
      donorName: validated.donorName,
      donorEmail: validated.donorEmail,
      donorPhone: validated.donorPhone,
      donationType: validated.type,
    });

    const donation = await prisma.donation.create({
      data: {
        orderId,
        donorName: validated.donorName,
        donorEmail: validated.donorEmail,
        donorPhone: validated.donorPhone,
        amount: validated.amount,
        type: donationType,
        message: validated.message,
        isAnonymous: validated.isAnonymous,
        paymentType: qrisTransaction.paymentType,
        midtransId: qrisTransaction.transactionId || null,
        snapToken: qrisTransaction.qrString || null,
        snapRedirectUrl: qrisTransaction.qrCodeUrl || redirectUrl,
        campaignId: validated.campaignId,
        userId: body.userId || null,
      },
    });

    return apiSuccess(
      {
        donation,
        redirectUrl,
      },
      "Transaksi donasi berhasil dibuat"
    );
  } catch (error) {
    console.error("Error creating donation:", error);
    if (error instanceof Error) {
      return apiError(error.message, 500);
    }
    return apiError("Gagal membuat donasi", 500);
  }
}
