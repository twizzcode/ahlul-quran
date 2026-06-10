import type { Metadata } from "next";
import { DonationStatusClient } from "@/components/donation/donation-status-client";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";
import { getManualBankTransferDetails } from "@/lib/donation/manual-bank-transfer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Status Donasi",
  description: "Halaman status transaksi donasi untuk mengecek progres pembayaran atau konfirmasi donasi.",
  path: "/donasi/status",
  robots: {
    index: false,
    follow: false,
  },
});

export default async function DonasiStatusPage({
  searchParams,
}: {
  searchParams: Promise<{
    order_id?: string;
    bank_name?: string;
    bank_account?: string;
    bank_holder?: string;
  }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id?.trim() || "";
  const profile = await getMasjidProfileData();
  const manualTransfer = getManualBankTransferDetails(profile);

  return (
    <DonationStatusClient
      orderId={orderId}
      bankName={params.bank_name?.trim() || manualTransfer.bankName}
      bankAccount={params.bank_account?.trim() || manualTransfer.bankAccount}
      bankHolder={params.bank_holder?.trim() || manualTransfer.bankHolder}
    />
  );
}
