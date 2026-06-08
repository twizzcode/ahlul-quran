import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { createDonationSchema } from "@/lib/validation/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { donation, donationCampaign } from "@/src/db/schema";

function buildOrderId() {
  return `DON-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createDonationSchema.safeParse({
      donorName: payload.donorName,
      donorEmail: payload.donorEmail || undefined,
      donorPhone: payload.donorPhone || undefined,
      amount: Number(payload.amount),
      message: payload.message || undefined,
      isAnonymous: Boolean(payload.isAnonymous),
      campaignId: payload.campaignId || undefined,
      paymentMethod: typeof payload.paymentMethod === "string" ? payload.paymentMethod : "",
    });

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data donasi tidak valid.", 400);
    }

    const data = parsed.data;
    const donorName = data.isAnonymous ? "Hamba Allah" : data.donorName.trim();
    const isQris = data.paymentMethod === "qris";
    const isBankTransfer = data.paymentMethod.startsWith("bank-");

    if (!isQris && !isBankTransfer) {
      return apiError("Metode pembayaran tidak valid.", 400);
    }

    const campaign = data.campaignId
      ? await db.query.donationCampaign.findFirst({
          where: eq(donationCampaign.id, data.campaignId),
          columns: { id: true, slug: true, isActive: true },
        })
      : null;

    if (data.campaignId && !campaign) {
      return apiError("Campaign donasi tidak ditemukan.", 404);
    }

    if (campaign && !campaign.isActive) {
      return apiError("Campaign donasi sedang tidak aktif.", 400);
    }

    const selectedBank = payload.selectedBank as
      | {
          bankName?: string;
          bankAccount?: string;
          bankHolder?: string;
        }
      | undefined;

    if (
      isBankTransfer &&
      (!selectedBank?.bankName?.trim() ||
        !selectedBank.bankAccount?.trim() ||
        !selectedBank.bankHolder?.trim())
    ) {
      return apiError("Informasi rekening bank belum lengkap.", 400);
    }

    const headerStore = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headerStore),
    });

    const orderId = buildOrderId();
    const selectedBankSnapshot =
      isBankTransfer && selectedBank
        ? {
            bankName: selectedBank.bankName!.trim(),
            bankAccount: selectedBank.bankAccount!.trim(),
            bankHolder: selectedBank.bankHolder!.trim(),
          }
        : null;

    await db.insert(donation).values({
      id: crypto.randomUUID(),
      orderId,
      donorName,
      donorEmail: data.donorEmail?.trim() || null,
      donorPhone: data.donorPhone?.trim() || null,
      amount: data.amount,
      message: data.message?.trim() || null,
      isAnonymous: data.isAnonymous,
      status: "PENDING",
      paymentType: isQris ? "manual_qris" : "manual_bank_transfer",
      bankName: selectedBankSnapshot?.bankName || null,
      bankAccount: selectedBankSnapshot?.bankAccount || null,
      bankHolder: selectedBankSnapshot?.bankHolder || null,
      userId: session?.user?.id || null,
      campaignId: campaign?.id || null,
    });

    const redirectParams = new URLSearchParams({ order_id: orderId });

    if (selectedBankSnapshot) {
      redirectParams.set("bank_name", selectedBankSnapshot.bankName);
      redirectParams.set("bank_account", selectedBankSnapshot.bankAccount);
      redirectParams.set("bank_holder", selectedBankSnapshot.bankHolder);
    }

    return apiSuccess(
      {
        orderId,
        redirectUrl: `/donasi/status?${redirectParams.toString()}`,
      },
      "Donasi berhasil dibuat.",
      201
    );
  } catch {
    return apiError("Gagal memproses donasi.", 500);
  }
}
