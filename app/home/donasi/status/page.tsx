import type { Metadata } from "next";
import { DonationStatusClient } from "@/components/donation-status-client";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";
import { getManualBankTransferDetails } from "@/lib/manual-bank-transfer";

export const metadata: Metadata = {
  title: "Status Donasi",
};

export default async function DonasiStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id?.trim() || "";
  const profile = await getMasjidProfileData();
  const manualTransfer = getManualBankTransferDetails(profile);

  return (
    <DonationStatusClient
      orderId={orderId}
      bankName={manualTransfer.bankName}
      bankAccount={manualTransfer.bankAccount}
      bankHolder={manualTransfer.bankHolder}
      whatsappNumber={manualTransfer.whatsappNumber}
    />
  );
}
