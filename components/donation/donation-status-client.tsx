"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type DonationStatusClientProps = {
  orderId: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

type DonationDetail = {
  orderId: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED" | "CHALLENGE" | "CANCELED";
  paymentType: string | null;
  createdAt: string;
  paidAt: string | null;
  qrisImageUrl?: string | null;
  donorName?: string | null;
};

function isManualBankTransfer(paymentType: string | null) {
  const normalized = (paymentType ?? "").toLowerCase();
  return normalized.includes("bank_transfer") || normalized.includes("manual_bank");
}

function isQrisPayment(paymentType: string | null) {
  return (paymentType ?? "").toLowerCase().includes("qris");
}

function getPaymentMethodLabel(paymentType: string | null) {
  if (isQrisPayment(paymentType)) {
    return "QRIS";
  }

  if (isManualBankTransfer(paymentType)) {
    return "Transfer Bank";
  }

  return paymentType ?? "-";
}

function getStatusMeta(donation: DonationDetail | null) {
  const status = donation?.status ?? "PENDING";
  const paymentType = donation?.paymentType ?? null;

  if (status === "SUCCESS") {
    return {
      label: "Berhasil",
      className: "bg-green-100 text-green-700",
      description:
        "Jazakumullahu khairan katsiran. Donasi Anda telah berhasil kami terima. Semoga Allah membalas dengan kebaikan yang berlipat, menjadikannya amal jariyah yang terus mengalir, serta melimpahkan kesehatan, keberkahan, dan kemudahan dalam setiap urusan Anda.",
    };
  }

  if (status === "FAILED") {
    return {
      label: "Gagal",
      className: "bg-red-100 text-red-700",
      description: "Pembayaran donasi gagal. Silakan coba kembali.",
    };
  }

  if (status === "CANCELED") {
    return {
      label: "Dibatalkan",
      className: "bg-slate-200 text-slate-700",
      description: "Transaksi donasi ini telah dibatalkan. Silakan buat donasi baru bila diperlukan.",
    };
  }

  if (status === "EXPIRED") {
    return {
      label: "Kadaluarsa",
      className: "bg-amber-100 text-amber-700",
      description: "Waktu pembayaran habis. Silakan buat transaksi donasi baru.",
    };
  }

  if (status === "CHALLENGE") {
    return {
      label: "Perlu Verifikasi",
      className: "bg-orange-100 text-orange-700",
      description: "Transaksi sedang ditinjau pihak pembayaran.",
    };
  }

  return {
    label: "Menunggu Pembayaran",
    className: "bg-yellow-100 text-yellow-700",
    description: isManualBankTransfer(paymentType)
      ? "Donasi transfer bank sudah tercatat dan sedang menunggu verifikasi admin."
      : "Donasi sedang diproses. Selesaikan pembayaran QRIS Anda.",
  };
}

export function DonationStatusClient({
  orderId,
  bankName,
  bankAccount,
  bankHolder,
}: DonationStatusClientProps) {
  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(orderId));
  const [isDownloadingQris, setIsDownloadingQris] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loadStatus = useCallback(
    async () => {
      if (!orderId) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/donations/${orderId}/status`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Status donasi tidak ditemukan.");
        }

        const donationData = result.data.donation as DonationDetail;
        setDonation(donationData);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Gagal mengambil status.");
      } finally {
        setIsLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (!orderId) {
      return;
    }

    loadStatus();
  }, [loadStatus, orderId]);

  const statusMeta = useMemo(
    () => getStatusMeta(donation),
    [donation]
  );
  const qrisImageUrl = donation?.qrisImageUrl || null;
  const handleDownloadQris = useCallback(() => {
    if (!qrisImageUrl || !donation) {
      return;
    }

    setIsDownloadingQris(true);
    const link = document.createElement("a");
    link.href = `/api/qris/download?url=${encodeURIComponent(qrisImageUrl)}&order_id=${encodeURIComponent(
      donation.orderId
    )}`;
    link.download = `${donation.orderId}-qris.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      setIsDownloadingQris(false);
    }, 800);
  }, [donation, qrisImageUrl]);
  const showManualTransferPanel =
    donation?.status === "PENDING" && isManualBankTransfer(donation.paymentType);
  const showQrisPanel = donation?.status === "PENDING" && isQrisPayment(donation.paymentType);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      {!orderId ? (
        <section className="py-6">
          <h2 className="text-2xl font-bold text-emerald-950">Order ID tidak ditemukan</h2>
          <p className="mt-2 text-slate-600">
            Parameter <span className="font-mono">order_id</span> belum tersedia.
          </p>
        </section>
      ) : isLoading ? (
        <section className="py-6">
          <h2 className="text-2xl font-bold text-emerald-950">Memuat status donasi...</h2>
          <p className="mt-2 text-slate-600">Sedang mengambil data donasi Anda.</p>
        </section>
      ) : errorMessage ? (
        <section className="py-6">
          <h2 className="text-2xl font-bold text-emerald-950">Status tidak ditemukan</h2>
          <p className="mt-2 text-slate-600">{errorMessage}</p>
        </section>
      ) : donation ? (
        <section className="space-y-8 py-4">
          <div className="border-b border-emerald-100 pb-6">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>
            {showQrisPanel ? (
              <div className="mt-3 space-y-2">
                <h1 className="text-3xl font-bold text-emerald-950">Pembayaran QRIS</h1>
                <p className="max-w-3xl text-slate-600">
                  Pindai QRIS berikut untuk menyelesaikan donasi, lalu kirim konfirmasi ke admin
                  agar pembayaran bisa diverifikasi.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <h1 className="text-3xl font-bold text-emerald-950">Status Donasi</h1>
                <p className="max-w-3xl text-slate-600">{statusMeta.description}</p>
              </div>
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,420px)]">
            <div className="space-y-8">
              {showQrisPanel ? (
                <section className="space-y-4">
                  {qrisImageUrl ? (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrisImageUrl}
                        alt="Kode QRIS donasi"
                        className="mx-auto h-auto w-full max-w-[420px]"
                      />
                    </div>
                  ) : null}
                </section>
              ) : null}

              {showManualTransferPanel ? (
                <section className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-emerald-950">Instruksi Transfer Bank</h2>
                    <p className="text-slate-600">
                      Transfer ke rekening berikut, lalu lanjutkan konfirmasi ke WhatsApp admin
                      dengan menyertakan order ID ini.
                    </p>
                  </div>
                  <div className="space-y-4 rounded-[28px] border border-emerald-100 bg-emerald-50/50 p-6">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Bank</span>
                      <span className="text-right font-semibold text-emerald-950">{bankName || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">No. Rekening</span>
                      <span className="text-right font-semibold text-emerald-950">{bankAccount || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Atas Nama</span>
                      <span className="text-right font-semibold text-emerald-950">{bankHolder || "-"}</span>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              {showQrisPanel ? (
                <section className="space-y-4 text-sm">
                  <h2 className="text-lg font-semibold text-emerald-950">Cara Pembayaran</h2>
                  <div className="space-y-2 text-slate-600">
                    <p>1. Buka aplikasi mobile banking atau e-wallet yang mendukung QRIS.</p>
                    <p>2. Scan QR code di sebelah kiri dan pastikan nominalnya sesuai.</p>
                    <p>3. Selesaikan pembayaran lalu kirim bukti atau konfirmasi ke admin.</p>
                  </div>
                </section>
              ) : null}

              <section className="space-y-4 text-sm">
                <h2 className="text-lg font-semibold text-emerald-950">Ringkasan Donasi</h2>
                <div className="space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono text-emerald-950">{donation.orderId}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Jumlah</span>
                    <span className="font-semibold text-emerald-950">{formatCurrency(donation.amount)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Metode</span>
                    <span className="text-emerald-950">{getPaymentMethodLabel(donation.paymentType)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Dibuat</span>
                    <span className="text-right text-emerald-950">{formatDateTime(donation.createdAt)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Dibayar</span>
                    <span className="text-right text-emerald-950">
                      {donation.paidAt ? formatDateTime(donation.paidAt) : "-"}
                    </span>
                  </div>
                </div>
              </section>

              <div className="space-y-3 border-t border-emerald-100 pt-6">
                {showQrisPanel ? (
                  <button
                    type="button"
                    onClick={handleDownloadQris}
                    disabled={isDownloadingQris || !qrisImageUrl}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDownloadingQris ? "Mengunduh..." : "Download QRIS"}
                  </button>
                ) : null}

                <Link
                  href="/"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </div>
  );
}
