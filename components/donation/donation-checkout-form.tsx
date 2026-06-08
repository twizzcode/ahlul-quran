"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Landmark, QrCode } from "lucide-react";
import { getBankOptionByLabel } from "@/lib/donation/bank-options";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth/auth-client";
import { formatCurrency } from "@/lib/utils";

type DonationCheckoutCampaign = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  collectedAmount: number;
  progress: number;
  endDate: string | null;
  supporters: Array<{
    name: string;
    amount: number;
  }>;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  logoUrl: string;
  qrisEnabled: boolean;
  qrisImageUrl: string | null;
  qrisIconUrl: string | null;
  qrisHolderName: string;
  bankAccounts: Array<{
    bankName: string;
    bankAccount: string;
    bankHolder: string;
    logoUrl: string;
    isActive: boolean;
  }>;
};

type DonationCheckoutFormProps = {
  campaign: DonationCheckoutCampaign;
};

const presetAmounts = [25000, 50000, 100000, 250000, 500000, 1000000];

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "HA"
  );
}

function buildAvatarDataUri(name: string, index: number) {
  const palette = [
    { background: "#115e59", foreground: "#ecfeff" },
    { background: "#14532d", foreground: "#f0fdf4" },
    { background: "#1d4ed8", foreground: "#eff6ff" },
    { background: "#7c2d12", foreground: "#fff7ed" },
    { background: "#6b21a8", foreground: "#faf5ff" },
  ];
  const selected = palette[index % palette.length];
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="${selected.background}" />
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${selected.foreground}">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getDaysLeftText(endDate: string | null) {
  if (!endDate) {
    return "Tanpa batas waktu";
  }

  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) {
    return "Berakhir";
  }

  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${daysLeft} hari lagi`;
}

export function DonationCheckoutForm({
  campaign,
}: DonationCheckoutFormProps) {
  const { data: session } = useSession();
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const activeBankAccounts = campaign.bankAccounts.filter(
    (item) => item.isActive && item.bankName && item.bankAccount && item.bankHolder
  );
  const availablePaymentMethods = [
    ...activeBankAccounts.map((account, index) => ({
      id: `bank-${index}`,
      type: "bank" as const,
      title: account.bankName,
      description: `Transfer ke rekening ${account.bankHolder}`,
      logoUrl: account.logoUrl || getBankOptionByLabel(account.bankName)?.logoUrl || "",
      bankAccount: account.bankAccount,
      bankHolder: account.bankHolder,
    })),
    ...(campaign.qrisEnabled
        ? [
          {
            id: "qris",
            type: "qris" as const,
            title: "QRIS",
            description: `Bayar ke ${campaign.qrisHolderName || "merchant QRIS"}`,
            logoUrl: campaign.logoUrl,
          },
        ]
      : []),
  ];
  const [paymentMethod, setPaymentMethod] = useState<string>(
    availablePaymentMethods[0]?.id ?? "bank-0"
  );

  const donationAmount = customAmount.trim() === "" ? selectedPresetAmount : Number(customAmount);
  const visibleSupporters = campaign.supporters.slice(0, 5);
  const extraSupporters = Math.max(campaign.supporters.length - visibleSupporters.length, 0);
  const selectedBankIndex = paymentMethod.startsWith("bank-")
    ? Number(paymentMethod.replace("bank-", ""))
    : -1;
  const selectedBankAccount =
    Number.isInteger(selectedBankIndex) && selectedBankIndex >= 0
      ? activeBankAccounts[selectedBankIndex]
      : null;

  useEffect(() => {
    if (!session?.user) return;

    setDonorName((current) => current || session.user.name || "");
    setDonorEmail((current) => current || session.user.email || "");

    const phone = (session.user as Record<string, unknown>).phone;
    if (typeof phone === "string") {
      setDonorPhone((current) => current || phone);
    }
  }, [session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!Number.isFinite(donationAmount) || donationAmount < 10000) {
      setErrorMessage("Minimal donasi Rp 10.000.");
      return;
    }

    if (!isAnonymous && donorName.trim().length < 2) {
      setErrorMessage("Nama donatur minimal 2 karakter.");
      return;
    }

    if (availablePaymentMethods.length === 0) {
      setErrorMessage("Metode pembayaran aktif belum tersedia.");
      return;
    }

    if (
      paymentMethod.startsWith("bank-") &&
      (!selectedBankAccount?.bankName ||
        !selectedBankAccount.bankAccount ||
        !selectedBankAccount.bankHolder)
    ) {
      setErrorMessage("Informasi rekening masjid belum tersedia.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorName: isAnonymous ? "Hamba Allah" : donorName.trim(),
          donorEmail: donorEmail.trim() || undefined,
          donorPhone: donorPhone.trim() || undefined,
          amount: donationAmount,
          message: message.trim() || undefined,
          isAnonymous,
          campaignId: campaign.id,
          paymentMethod,
          selectedBank: selectedBankAccount
            ? {
                bankName: selectedBankAccount.bankName,
                bankAccount: selectedBankAccount.bankAccount,
                bankHolder: selectedBankAccount.bankHolder,
              }
            : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        setErrorMessage(result?.message || "Gagal memproses donasi.");
        return;
      }

      const redirectUrl = result?.data?.redirectUrl as string | undefined;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      setErrorMessage("Token pembayaran tidak tersedia. Silakan coba lagi.");
    } catch {
      setErrorMessage("Terjadi kendala jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <form
        className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 lg:space-y-0"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8 lg:pr-10 lg:border-r lg:border-emerald-100">
          <article>
            <div className="grid gap-5 md:grid-cols-[210px_minmax(0,1fr)] md:items-start">
              <div className="relative h-40 overflow-hidden rounded-[20px] bg-emerald-50 md:h-[170px]">
                <Image
                  src={campaign.coverImage || "/Gambar-masjid.png"}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-2xl font-bold leading-tight capitalize text-emerald-950">
                  {campaign.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-emerald-900/72">
                  {campaign.description}
                </p>

                <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
                  <p className="text-2xl font-bold tracking-tight text-emerald-950">
                    {formatCurrency(campaign.collectedAmount)}
                  </p>
                  <p className="text-sm text-emerald-800/70">terkumpul dari</p>
                  <p className="text-lg font-semibold text-emerald-900">
                    {formatCurrency(campaign.targetAmount)}
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center">
                    {visibleSupporters.length > 0 ? (
                      <TooltipProvider>
                        <AvatarGroup className="-space-x-1.5">
                          {visibleSupporters.map((supporter, index) => (
                            <Tooltip key={`${supporter.name}-${index}`}>
                              <TooltipTrigger asChild>
                                <div>
                                  <Avatar
                                    size="sm"
                                    className="size-5 ring-2 ring-white transition-transform hover:z-10 hover:scale-110"
                                  >
                                    <AvatarImage
                                      src={buildAvatarDataUri(supporter.name, index)}
                                      alt={supporter.name}
                                    />
                                  <AvatarFallback className="bg-emerald-900 text-[8px] font-semibold text-white">
                                    {getInitials(supporter.name)}
                                  </AvatarFallback>
                                  </Avatar>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={8}>
                                <p className="font-semibold">{supporter.name}</p>
                                <p>{formatCurrency(supporter.amount)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {extraSupporters > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <AvatarGroupCount className="size-5 bg-emerald-700 text-[7px] font-semibold text-white ring-2 ring-white">
                                    +{extraSupporters}
                                  </AvatarGroupCount>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={8}>
                                <p>Donatur lainnya</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </AvatarGroup>
                      </TooltipProvider>
                    ) : (
                      <Avatar size="sm" className="size-5 ring-2 ring-white">
                        <AvatarFallback className="bg-emerald-900 text-[8px] font-semibold text-white">
                          HA
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <p className="shrink-0 text-sm text-emerald-800/70">
                    {getDaysLeftText(campaign.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-emerald-950">
                Donasi & Metode Pembayaran
              </h2>
              <p className="mt-1 text-sm text-emerald-900/65">
                Pilih nominal donasi dan metode pembayaran yang ingin digunakan.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-emerald-950">Jumlah Donasi</label>
              <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    data-selected={selectedPresetAmount === amount && customAmount.trim() === ""}
                    onClick={() => {
                      setSelectedPresetAmount(amount);
                      setCustomAmount("");
                    }}
                    className="rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-sm font-medium text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50 data-[selected=true]:border-emerald-900 data-[selected=true]:bg-emerald-900 data-[selected=true]:text-white"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={10000}
                placeholder="Atau masukkan jumlah lain..."
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                className="flex h-11 w-full rounded-xl border border-emerald-100 bg-white px-4 py-2 text-sm text-emerald-950"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-emerald-950">Metode Pembayaran</label>
              <div className="grid gap-3">
                {availablePaymentMethods.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-4 text-sm text-emerald-900/70">
                    Belum ada metode pembayaran yang aktif di panel admin.
                  </div>
                ) : (
                  availablePaymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      data-selected={paymentMethod === method.id}
                      className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 data-[selected=true]:border-emerald-900 data-[selected=true]:bg-emerald-50"
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                        {method.logoUrl ? (
                          <Image
                            src={method.logoUrl}
                            alt={method.title}
                            fill
                            className={method.type === "qris" ? "object-contain p-1.5" : "object-contain p-2"}
                          />
                        ) : method.type === "qris" ? (
                          <QrCode className="h-6 w-6 text-emerald-800" />
                        ) : (
                          <Landmark className="h-6 w-6 text-emerald-800" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-emerald-950">{method.title}</p>
                        <p className="text-sm text-emerald-900/65">{method.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <Separator className="mt-6 bg-emerald-100" />

            <div className="mt-5 text-sm text-emerald-900/75">
              <p>
                Total donasi:{" "}
                <span className="font-semibold text-emerald-950">{formatCurrency(donationAmount || 0)}</span>
              </p>
            </div>
          </section>
        </div>

        <div className="lg:pl-0">
          <section>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-emerald-950">Detail Donatur</h2>
              <p className="mt-1 text-sm text-emerald-900/65">
                Isi data donatur untuk kebutuhan pencatatan dan konfirmasi pembayaran.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-950">Nama Donatur</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  value={donorName}
                  onChange={(event) => setDonorName(event.target.value)}
                  disabled={isAnonymous}
                  className="flex h-11 w-full rounded-xl border border-emerald-100 bg-white px-4 py-2 text-sm text-emerald-950 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-emerald-950">Email (opsional)</label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={donorEmail}
                  onChange={(event) => setDonorEmail(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-emerald-100 bg-white px-4 py-2 text-sm text-emerald-950"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-emerald-950">No. HP (opsional)</label>
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={donorPhone}
                onChange={(event) => setDonorPhone(event.target.value)}
                className="flex h-11 w-full rounded-xl border border-emerald-100 bg-white px-4 py-2 text-sm text-emerald-950"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-emerald-950">Pesan / Doa (opsional)</label>
              <textarea
                placeholder="Tuliskan pesan atau doa..."
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="flex w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-emerald-950"
              />
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-emerald-900/80">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
                className="rounded"
              />
              Donasi sebagai Hamba Allah (anonim)
            </label>
          </section>

          <div className="mt-8 border-t border-emerald-100 pt-6">
            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className={errorMessage ? "mt-4 w-full rounded-2xl bg-emerald-900 hover:bg-emerald-800" : "w-full rounded-2xl bg-emerald-900 hover:bg-emerald-800"}
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? paymentMethod === "qris"
                  ? "Menyiapkan QRIS..."
                  : "Membuat Instruksi Transfer..."
                : paymentMethod === "qris"
                  ? "Lanjut ke Pembayaran QRIS"
                  : "Buat Instruksi Transfer"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
