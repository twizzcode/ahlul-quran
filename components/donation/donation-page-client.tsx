"use client";

import AnimatedTooltipPreview, {
  type DonorHighlightItem,
} from "@/components/shared/animated-tooltip-demo";
import { PageIntro } from "@/components/content/page-intro";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
  createdAt: string;
  supporters: Array<{
    name: string;
    amount: number;
  }>;
};

export type DonationItemView = {
  id: string;
  donorName: string;
  amount: number;
  createdAt: string;
  campaignTitle: string | null;
};

type DonationPageClientProps = {
  campaigns: DonationCampaignView[];
  recentDonations: DonationItemView[];
  donorHighlights: DonorHighlightItem[];
};

const CAMPAIGNS_PER_PAGE = 12;
type DateSortValue = "newest" | "oldest";

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

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages] as const;
}

export function DonationPageClient({
  campaigns,
  recentDonations,
  donorHighlights,
}: DonationPageClientProps) {
  const [query, setQuery] = useState("");
  const [showExpired, setShowExpired] = useState(false);
  const [dateSort, setDateSort] = useState<DateSortValue>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const isExpired =
        campaign.endDate !== null && new Date(campaign.endDate).getTime() <= Date.now();

      if (!showExpired && isExpired) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [campaign.title, campaign.description].join(" ").toLowerCase();
      return searchableText.includes(normalizedQuery);
    })
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();

      return dateSort === "newest" ? rightTime - leftTime : leftTime - rightTime;
    });
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / CAMPAIGNS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCampaigns = filteredCampaigns.slice(
    (safeCurrentPage - 1) * CAMPAIGNS_PER_PAGE,
    safeCurrentPage * CAMPAIGNS_PER_PAGE
  );
  const pageItems = buildPageItems(safeCurrentPage, totalPages);

  useEffect(() => {
    startTransition(() => {
      setCurrentPage(1);
    });
  }, [normalizedQuery, showExpired, dateSort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      startTransition(() => {
        setCurrentPage(totalPages);
      });
    }
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    startTransition(() => {
      setCurrentPage(page);
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <PageIntro
        className="mb-12"
        title="Donasi Online"
        description="Pilih campaign yang ingin Anda dukung, baca detailnya, lalu lanjutkan ke pembayaran pada halaman campaign tersebut."
      />

      <div className="mb-12 grid gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Program Donasi</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Menampilkan {filteredCampaigns.length} dari {campaigns.length} campaign.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 sm:max-w-md">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari campaign..."
                  className="h-11 rounded-xl pl-10 pr-11"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-xl border-emerald-100"
                    aria-label="Filter campaign"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[240] min-w-[260px] rounded-2xl border-emerald-100 p-2"
                >
                  <DropdownMenuCheckboxItem
                    indicatorPosition="right"
                    checked={showExpired}
                    onCheckedChange={(checked) => setShowExpired(checked)}
                    className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
                  >
                    Tampilkan yang expired
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator className="bg-emerald-100" />
                  <DropdownMenuCheckboxItem
                    indicatorPosition="right"
                    checked={dateSort === "oldest"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDateSort("oldest");
                      }
                    }}
                    className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
                  >
                    Dari yang terlama
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    indicatorPosition="right"
                    checked={dateSort === "newest"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDateSort("newest");
                      }
                    }}
                    className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
                  >
                    Dari yang terbaru
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              {normalizedQuery
                ? "Campaign tidak ditemukan."
                : showExpired
                  ? "Belum ada campaign donasi."
                  : "Belum ada campaign yang masih aktif."}
            </div>
          ) : (
            <div id="donation-grid" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedCampaigns.map((campaign) => {
                const visibleSupporters = campaign.supporters.slice(0, 5);
                const extraSupporters = Math.max(campaign.supporters.length - visibleSupporters.length, 0);

                return (
                  <article
                    key={campaign.id}
                    className="group overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
                  >
                    <Link href={`/donasi/${campaign.slug}`} className="block">
                      <div className="flex h-full flex-col">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={campaign.coverImage || "/Gambar-masjid.png"}
                            alt={campaign.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 p-4 pt-3">
                          <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-bold leading-tight text-slate-900 capitalize">
                            {truncateText(campaign.title, 42)}
                          </h3>

                          <div className="mt-3 flex items-end gap-2">
                            <p className="text-base font-bold tracking-tight text-slate-900">
                              {formatCurrency(campaign.collectedAmount)}
                            </p>
                            <p className="pb-0.5 text-[10px] text-slate-500">terkumpul</p>
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
                                              className="size-5 ring-1 ring-white transition-transform hover:z-10 hover:scale-110"
                                            >
                                              <AvatarImage
                                                src={buildAvatarDataUri(supporter.name, index)}
                                                alt={supporter.name}
                                              />
                                              <AvatarFallback className="bg-slate-700 text-[8px] font-semibold text-white">
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
                                            <AvatarGroupCount className="size-5 bg-slate-500 text-[7px] font-semibold text-white ring-1 ring-white">
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
                                <Avatar size="sm" className="size-5 ring-1 ring-white">
                                  <AvatarFallback className="bg-slate-700 text-[8px] font-semibold text-white">
                                    HA
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <p className="shrink-0 text-[10px] text-slate-500">
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

          {filteredCampaigns.length > 0 ? (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#donation-grid"
                    aria-disabled={safeCurrentPage === 1}
                    className={safeCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    onClick={(event) => {
                      event.preventDefault();
                      if (safeCurrentPage > 1) {
                        goToPage(safeCurrentPage - 1);
                      }
                    }}
                  />
                </PaginationItem>

                {pageItems.map((item, index) => {
                  if (typeof item !== "number") {
                    return (
                      <PaginationItem key={`${item}-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#donation-grid"
                        isActive={item === safeCurrentPage}
                        className="cursor-pointer rounded-xl border-emerald-100 data-[active=true]:border-emerald-900 data-[active=true]:bg-emerald-900 data-[active=true]:text-white"
                        onClick={(event) => {
                          event.preventDefault();
                          goToPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#donation-grid"
                    aria-disabled={safeCurrentPage === totalPages}
                    className={safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    onClick={(event) => {
                      event.preventDefault();
                      if (safeCurrentPage < totalPages) {
                        goToPage(safeCurrentPage + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </section>

        <aside className="xl:col-span-1">
          <section className="xl:sticky xl:top-24">
            <h2 className="mb-6 text-xl font-semibold">Donasi Terbaru</h2>
            {recentDonations.length === 0 ? (
              <div className="py-2 text-sm text-muted-foreground">
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
        </aside>
      </div>

      {donorHighlights.length > 0 ? (
        <section className="mt-12">
          <AnimatedTooltipPreview items={donorHighlights} />
        </section>
      ) : null}

    </div>
  );
}
