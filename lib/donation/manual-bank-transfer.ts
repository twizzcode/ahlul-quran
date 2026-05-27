type ManualBankTransferSource = {
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
  phone?: string | null;
};

export type ManualBankTransferDetails = {
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  whatsappNumber: string;
};

const DEFAULT_MANUAL_BANK_TRANSFER: ManualBankTransferDetails = {
  bankName: "Bank Syariah Indonesia (BSI)",
  bankAccount: "7123456789",
  bankHolder: "Yayasan Ahlul Qur'an",
  whatsappNumber: "6281234567890",
};

function normalizeWhatsappNumber(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_MANUAL_BANK_TRANSFER.whatsappNumber;
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return DEFAULT_MANUAL_BANK_TRANSFER.whatsappNumber;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  return DEFAULT_MANUAL_BANK_TRANSFER.whatsappNumber;
}

export function getManualBankTransferDetails(
  source?: ManualBankTransferSource | null
): ManualBankTransferDetails {
  return {
    bankName: source?.bankName?.trim() || DEFAULT_MANUAL_BANK_TRANSFER.bankName,
    bankAccount: source?.bankAccount?.trim() || DEFAULT_MANUAL_BANK_TRANSFER.bankAccount,
    bankHolder: source?.bankHolder?.trim() || DEFAULT_MANUAL_BANK_TRANSFER.bankHolder,
    whatsappNumber: normalizeWhatsappNumber(source?.phone),
  };
}

export function buildDonationConfirmationWhatsappUrl(input: {
  whatsappNumber: string;
  orderId: string;
  amount: number;
  donorName?: string | null;
}) {
  const lines = [
    "Assalamu'alaikum, saya ingin konfirmasi donasi.",
    `Order ID: ${input.orderId}`,
    `Nominal: Rp${Math.round(input.amount).toLocaleString("id-ID")}`,
  ];

  if (input.donorName) {
    lines.push(`Nama: ${input.donorName}`);
  }

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${input.whatsappNumber}?text=${message}`;
}
