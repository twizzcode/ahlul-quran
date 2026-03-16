"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QRIS_EXPIRY_MINUTES } from "@/lib/donation-payment";
import { buildDonationConfirmationWhatsappUrl } from "@/lib/manual-bank-transfer";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type DonationStatusClientProps = {
  orderId: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  whatsappNumber: string;
};

type DonationDetail = {
  orderId: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED" | "EXPIRED" | "CHALLENGE" | "CANCELED";
  paymentType: string | null;
  createdAt: string;
  paidAt: string | null;
  snapRedirectUrl?: string | null;
  donorName?: string | null;
};

function isManualBsiTransfer(paymentType: string | null) {
  return (paymentType ?? "").toLowerCase().includes("bsi");
}

function isQrisPayment(paymentType: string | null) {
  return (paymentType ?? "").toLowerCase().includes("qris");
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
    description: isManualBsiTransfer(paymentType)
      ? "Donasi transfer bank sudah tercatat dan sedang menunggu verifikasi admin."
      : "Donasi sedang diproses. Selesaikan pembayaran QRIS Anda melalui Midtrans.",
  };
}

export function DonationStatusClient({
  orderId,
  bankName,
  bankAccount,
  bankHolder,
  whatsappNumber,
}: DonationStatusClientProps) {
  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(orderId));
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [isDownloadingQris, setIsDownloadingQris] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const loadStatus = useCallback(
    async (mode: "initial" | "manual" | "silent") => {
      if (!orderId) {
        return;
      }

      if (mode === "initial") {
        setIsLoading(true);
      }

      if (mode === "manual") {
        setIsCheckingStatus(true);
      }

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
        if (mode === "initial") {
          setIsLoading(false);
        }

        if (mode === "manual") {
          setIsCheckingStatus(false);
        }
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    loadStatus("initial");

    intervalId = setInterval(() => {
      loadStatus("silent");
    }, 8000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadStatus, orderId]);

  useEffect(() => {
    if (!donation || !isQrisPayment(donation.paymentType) || donation.status !== "PENDING") {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [donation]);

  const statusMeta = useMemo(
    () => getStatusMeta(donation),
    [donation]
  );
  const qrisExpiresAt = donation
    ? new Date(donation.createdAt).getTime() + QRIS_EXPIRY_MINUTES * 60 * 1000
    : null;
  const qrisRemainingMs = qrisExpiresAt ? Math.max(qrisExpiresAt - currentTime, 0) : 0;
  const qrisRemainingMinutes = Math.floor(qrisRemainingMs / 60000);
  const qrisRemainingSeconds = Math.floor((qrisRemainingMs % 60000) / 1000);
  const qrisCountdown = `${String(qrisRemainingMinutes).padStart(2, "0")}:${String(
    qrisRemainingSeconds
  ).padStart(2, "0")}`;
  const transferConfirmationUrl = donation
    ? buildDonationConfirmationWhatsappUrl({
        whatsappNumber,
        orderId: donation.orderId,
        amount: donation.amount,
        donorName: donation.donorName,
      })
    : null;
  const handleDownloadQris = useCallback(async () => {
    if (!donation?.snapRedirectUrl) {
      return;
    }

    setIsDownloadingQris(true);

    try {
      const response = await fetch(donation.snapRedirectUrl);
      if (!response.ok) {
        throw new Error("Gagal mengunduh QRIS.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${donation.orderId}-qris.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorMessage("Gagal mengunduh QRIS. Silakan coba lagi.");
    } finally {
      setIsDownloadingQris(false);
    }
  }, [donation]);
  const showManualTransferPanel =
    donation?.status === "PENDING" && isManualBsiTransfer(donation.paymentType);
  const showQrisPanel = donation?.status === "PENDING" && isQrisPayment(donation.paymentType);
  const showSuccessActions = donation?.status === "SUCCESS";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          {!orderId ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-emerald-950">Order ID tidak ditemukan</h2>
              <p className="mb-6 text-muted-foreground">
                Parameter <span className="font-mono">order_id</span> belum tersedia.
              </p>
            </>
          ) : isLoading ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-emerald-950">Memuat status donasi...</h2>
              <p className="mb-6 text-muted-foreground">
                Sedang mengecek status pembayaran ke Midtrans.
              </p>
            </>
          ) : errorMessage ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-emerald-950">Status tidak ditemukan</h2>
              <p className="mb-6 text-muted-foreground">{errorMessage}</p>
            </>
          ) : donation ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-emerald-950">Status Donasi</h2>
              <p className="mb-6 text-muted-foreground">{statusMeta.description}</p>

              <div
                className={`grid gap-4 text-left ${
                  showManualTransferPanel || showQrisPanel
                    ? "lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] lg:items-stretch"
                    : ""
                }`}
              >
                {showManualTransferPanel || showQrisPanel ? (
                  <div className="h-full space-y-4">
                    {showManualTransferPanel ? (
                      <div className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 text-sm">
                        <p className="text-base font-semibold text-slate-900">
                          Instruksi Transfer BSI
                        </p>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Bank</span>
                            <span className="font-semibold text-slate-900">{bankName || "-"}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">No. Rekening</span>
                            <span className="font-semibold text-slate-900">
                              {bankAccount || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Atas Nama</span>
                            <span className="font-semibold text-slate-900">{bankHolder || "-"}</span>
                          </div>
                        </div>
                        <p className="mt-4 leading-7 text-muted-foreground">
                          Setelah transfer ke rekening di atas, lanjutkan konfirmasi ke WhatsApp
                          admin dengan menyertakan order ID ini. Status akan berubah setelah admin
                          memverifikasi pembayaran Anda.
                        </p>
                        {transferConfirmationUrl ? (
                          <div className="mt-auto border-t border-emerald-100 pt-4">
                            <a
                              href={transferConfirmationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                            >
                              Konfirmasi ke WhatsApp
                            </a>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {showQrisPanel ? (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 text-sm">
                        <p className="text-base font-semibold text-slate-900">Pembayaran QRIS</p>
                        <p className="mt-2 text-muted-foreground">
                          Pindai QRIS berikut untuk menyelesaikan donasi. Setelah pembayaran
                          berhasil, status akan berubah otomatis atau bisa dicek manual.
                        </p>
                        {donation.snapRedirectUrl ? (
                          <div className="mt-4 overflow-hidden rounded-2xl border bg-white p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={donation.snapRedirectUrl}
                              alt="Kode QRIS donasi"
                              className="mx-auto h-auto w-full max-w-[280px]"
                            />
                          </div>
                        ) : null}
                        <div className="mt-4 rounded-2xl bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Batas waktu QRIS
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">{qrisCountdown}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex h-full flex-col gap-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 text-sm">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Ringkasan Donasi
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-mono">{donation.orderId}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Status</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Jumlah</span>
                        <span className="font-semibold">{formatCurrency(donation.amount)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Metode</span>
                        <span>{donation.paymentType ?? "-"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Dibuat</span>
                        <span>{formatDateTime(donation.createdAt)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Dibayar</span>
                        <span>{donation.paidAt ? formatDateTime(donation.paidAt) : "-"}</span>
                      </div>
                    </div>
                  </div>

                  {showQrisPanel ? (
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Cara Pembayaran
                      </p>
                      <div className="space-y-2 text-muted-foreground">
                        <p>1. Buka aplikasi mobile banking atau e-wallet yang mendukung QRIS.</p>
                        <p>2. Scan QR code di kolom kiri dan pastikan nominalnya sesuai.</p>
                        <p>3. Selesaikan pembayaran. Status donasi akan diperbarui otomatis.</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-auto space-y-3 text-sm">
                    {showSuccessActions ? (
                      <>
                        <a
                          href="/"
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
                        >
                          Kembali ke Beranda
                        </a>
                        <a
                          href="/donasi"
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
                        >
                          Donasi Lagi
                        </a>
                      </>
                    ) : (
                      <>
                        {showQrisPanel ? (
                          <button
                            type="button"
                            onClick={handleDownloadQris}
                            disabled={
                              isDownloadingQris || !showQrisPanel || !donation?.snapRedirectUrl
                            }
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDownloadingQris ? "Mengunduh..." : "Download QRIS"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => loadStatus("manual")}
                          disabled={isCheckingStatus || !orderId}
                          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCheckingStatus ? "Mengecek..." : "Cek Status"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
