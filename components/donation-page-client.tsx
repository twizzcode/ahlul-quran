"use client";

import AnimatedTooltipPreview, {
  type DonorHighlightItem,
} from "@/components/animated-tooltip-demo";
import { PageIntro } from "@/components/page-intro";
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
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDateTime, truncateText } from "@/lib/utils";

export type DonationCampaignView = {
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
};

export type DonationItemView = {
  id: string;
  donorName: string;
  amount: number;
  type: string;
  createdAt: string;
  campaignTitle: string | null;
};

type DonationPageClientProps = {
  campaigns: DonationCampaignView[];
  recentDonations: DonationItemView[];
  donorHighlights: DonorHighlightItem[];
};

const donationTypes = [
  { value: "INFAQ", label: "Infaq" },
  { value: "SEDEKAH", label: "Sedekah" },
  { value: "ZAKAT", label: "Zakat" },
  { value: "WAKAF", label: "Wakaf" },
  { value: "PEMBANGUNAN", label: "Pembangunan" },
  { value: "OPERASIONAL", label: "Operasional" },
  { value: "OTHER", label: "Lainnya" },
] as const;

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

function getDaysLeftText(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) {
    return "Berakhir";
  }

  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${daysLeft} hari lagi`;
}

export function DonationPageClient({
  campaigns,
  recentDonations,
  donorHighlights,
}: DonationPageClientProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <PageIntro
        className="mb-12"
        title="Donasi Online"
        description="Pilih campaign yang ingin Anda dukung, baca detailnya, lalu lanjutkan ke pembayaran pada halaman campaign tersebut."
      />

      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold">Program Donasi</h2>
        {campaigns.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
            Belum ada kampanye donasi.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-5">
            {campaigns.map((campaign) => {
              const visibleSupporters = campaign.supporters.slice(0, 5);
              const extraSupporters = Math.max(campaign.supporters.length - visibleSupporters.length, 0);

              return (
                <article
                  key={campaign.id}
                  className="group overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
                >
                  <Link href={`/donasi/${campaign.slug}`} className="block">
                    <div className="flex h-full flex-col md:grid md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:items-start md:gap-4 md:p-4">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[22px] md:rounded-[14px]">
                        <Image
                          src={campaign.coverImage || "/Gambar-masjid.png"}
                          alt={campaign.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.74)_0%,rgba(15,23,42,0.22)_70%,rgba(15,23,42,0.04)_100%)]" />
                      </div>

                      <div className="min-w-0 p-4 pt-3 md:p-0">
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-slate-900 capitalize md:min-h-[3.5rem] md:text-lg">
                          {truncateText(campaign.title, 42)}
                        </h3>

                        <div className="mt-3 flex items-end gap-2">
                          <p className="text-sm font-bold tracking-tight text-slate-900 md:text-[1.1rem]">
                            {formatCurrency(campaign.collectedAmount)}
                          </p>
                          <p className="pb-0.5 text-[10px] text-slate-500 md:text-xs">terkumpul</p>
                        </div>

                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
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
                                            className="size-4 ring-1 ring-white transition-transform hover:z-10 hover:scale-110"
                                          >
                                            <AvatarImage
                                              src={buildAvatarDataUri(supporter.name, index)}
                                              alt={supporter.name}
                                            />
                                            <AvatarFallback className="bg-slate-700 text-[7px] font-semibold text-white">
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
                                          <AvatarGroupCount className="size-4 bg-slate-500 text-[6px] font-semibold text-white ring-1 ring-white">
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
                              <Avatar size="sm" className="size-4 ring-1 ring-white">
                                <AvatarFallback className="bg-slate-700 text-[7px] font-semibold text-white">
                                  HA
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <p className="shrink-0 text-[10px] text-slate-500 md:text-xs">
                            {campaign.endDate
                              ? getDaysLeftText(campaign.endDate)
                              : "Tanpa batas waktu"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {donorHighlights.length > 0 ? (
        <section className="mt-12">
          <AnimatedTooltipPreview items={donorHighlights} />
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-6 text-xl font-semibold">Donasi Terbaru</h2>
        {recentDonations.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Belum ada donasi terbaru.
          </div>
        ) : (
          <div className="space-y-3">
            {recentDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {donation.donorName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("") || "HA"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{donation.donorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {donationTypes.find((type) => type.value === donation.type)?.label ||
                        donation.type}
                      {" • "}
                      {formatDateTime(donation.createdAt)}
                      {donation.campaignTitle ? ` • ${donation.campaignTitle}` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(donation.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
