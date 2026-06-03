import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Users,
} from "lucide-react";
import { LinkedGalleryViewer } from "@/components/content/linked-gallery-viewer";
import { Button } from "@/components/ui/button";
import {
  getDonationCampaignUpdateHref,
  isDonationCampaignUpdateSchemaMismatchError,
} from "@/lib/donation/donation-campaign-updates";
import { MobileDonationStickyBar } from "@/components/donation/mobile-donation-sticky-bar";
import { Separator } from "@/components/ui/separator";
import dbQuery from "@/lib/data/db-query";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getDaysLeft(endDate: Date | null) {
  if (!endDate) return "Tanpa batas waktu";

  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return "Berakhir";

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} hari lagi`;
}

function splitDescription(description: string) {
  return description
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

type DonationCampaignDetailResult = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  endDate: Date | null;
  donations: Array<{
    id: string;
    donorName: string;
    isAnonymous: boolean;
    amount: number;
    createdAt: Date;
  }>;
  updates?: Array<{
    id: string;
    title: string;
    slug: string;
    type: "berita" | "artikel";
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    category: {
      name: string;
      slug: string;
    } | null;
  }>;
  galleries?: Array<{
    id: string;
    title: string;
    description: string | null;
    createdAt: Date;
    images: Array<{
      id: string;
      url: string;
      caption: string | null;
      order: number;
    }>;
  }>;
} | null;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await dbQuery.donationCampaign.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!campaign) {
    return {
      title: "Kampanye Donasi",
    };
  }

  return {
    title: campaign.title,
    description: campaign.description,
  };
}

export default async function DonationCampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let campaign: DonationCampaignDetailResult;

  try {
    campaign = await dbQuery.donationCampaign.findUnique({
      where: { slug },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: {
            id: true,
            donorName: true,
            isAnonymous: true,
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        updates: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            createdAt: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        },
      },
    });
  } catch (error) {
    if (!isDonationCampaignUpdateSchemaMismatchError(error)) {
      throw error;
    }

    campaign = await dbQuery.donationCampaign.findUnique({
      where: { slug },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: {
            id: true,
            donorName: true,
            isAnonymous: true,
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
  }

  if (!campaign) {
    notFound();
  }

  const collectedAmount = campaign.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const donationCount = campaign.donations.length;
  const progress =
    campaign.targetAmount > 0
      ? Math.min(100, Math.round((collectedAmount / campaign.targetAmount) * 100))
      : 0;
  const descriptionParts = splitDescription(campaign.description);
  const daysLeftLabel = getDaysLeft(campaign.endDate);
  const descriptionLead = descriptionParts[0] ?? campaign.description;
  const descriptionRest = descriptionParts.slice(1);
  const updates = campaign.updates ?? [];
  const linkedGalleries = (campaign.galleries ?? []).map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    description: gallery.description,
    createdAt: gallery.createdAt.toISOString(),
    images: gallery.images.map((image) => ({
      id: image.id,
      url: image.url,
      caption: image.caption,
    })),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-[calc(var(--home-nav-height)+1rem)] md:px-0 lg:pb-14">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/donasi">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Donasi
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-start">
        <div>
          <div className="relative overflow-hidden rounded-[28px] bg-slate-950">
            <Image
              src={campaign.coverImage || "/Gambar-masjid.png"}
              alt={campaign.title}
              width={1200}
              height={900}
              priority
              className="h-auto w-full object-cover"
            />
          </div>

          <section className="mt-6 lg:hidden">
            <h1 className="text-3xl font-bold leading-tight tracking-tight capitalize text-emerald-950">
              {campaign.title}
            </h1>

            <div className="mt-5">
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1 text-slate-500">
                <p className="text-2xl font-bold tracking-tight text-emerald-950">
                  {formatCurrency(collectedAmount)}
                </p>
                <p className="pb-0.5 text-sm text-slate-500">terkumpul dari</p>
                <p className="text-lg font-semibold text-emerald-900">
                  {formatCurrency(campaign.targetAmount)}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-base font-semibold text-emerald-900">{progress}%</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-emerald-100 pt-5 text-center">
              <div>
                <Users className="mx-auto h-5 w-5 text-emerald-700" />
                <p className="mt-2 text-base font-semibold text-emerald-950">{donationCount}</p>
                <p className="text-sm text-slate-500">Donatur</p>
              </div>
              <div>
                <CalendarDays className="mx-auto h-5 w-5 text-emerald-700" />
                <p className="mt-2 text-base font-semibold text-emerald-950">{daysLeftLabel}</p>
                <p className="text-sm text-slate-500">Durasi</p>
              </div>
            </div>

            <section className="mt-6 border-t border-emerald-100 pt-5">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-emerald-900 py-6 text-base hover:bg-emerald-800"
                asChild
              >
                <Link href={`/donasi/${campaign.slug}/bayar`}>Donasi Sekarang</Link>
              </Button>
            </section>
          </section>

          <details className="group mt-7 border-t border-emerald-100 py-5" open>
            <summary className="cursor-pointer list-none text-2xl font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Deskripsi Program</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <span>Lihat</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </span>
              </div>
            </summary>
            <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
              <p>{descriptionLead}</p>
              {descriptionRest.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              <p>
                Donasi yang masuk melalui halaman ini akan tercatat khusus untuk kampanye{" "}
                <span className="font-semibold">{campaign.title}</span>, bukan ke donasi umum.
              </p>
            </div>
          </details>

          <details className="group mt-2 border-t border-emerald-100 py-5">
            <summary className="cursor-pointer list-none text-2xl font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Update Terbaru</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <span>Lihat</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </span>
              </div>
            </summary>
            {updates.length === 0 ? (
              <div className="mt-4 text-base leading-8 text-slate-700">Belum ada update.</div>
            ) : (
              <div className="mt-5 space-y-6">
                {updates.map((article) => {
                  const publishedAt = article.publishedAt ?? article.createdAt;
                  const href = getDonationCampaignUpdateHref(article);

                  return (
                    <article key={article.id} className="relative pl-8">
                      <span className="absolute left-[7px] top-2 h-full w-px bg-emerald-100" />
                      <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-orange-500 shadow-sm" />

                      <p className="text-sm font-medium text-slate-600">
                        Tanggal, {formatDate(publishedAt)}
                      </p>

                      <div className="mt-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-3.5">
                          {article.coverImage ? (
                            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-slate-200 md:w-[190px]">
                              <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold leading-tight capitalize text-emerald-950">
                              {article.title}
                            </h3>

                            <p className="mt-2.5 text-sm leading-5.5 text-slate-700">
                              {article.excerpt ||
                                "Lihat berita lengkap untuk mengetahui perkembangan terbaru dari kampanye ini."}
                            </p>

                            <Link
                              href={href}
                              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-700"
                            >
                              Selengkapnya
                              <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </details>

          <details id="donatur" className="group mt-2 border-t border-emerald-100 py-5">
            <summary className="cursor-pointer list-none text-2xl font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Donatur</span>
                <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <span>Lihat</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </span>
              </div>
            </summary>
            {campaign.donations.length === 0 ? (
              <div className="mt-4 text-sm text-slate-500">
                Belum ada donasi tercatat untuk kampanye ini.
              </div>
            ) : (
              <div className="mt-4">
                {campaign.donations.map((donation) => (
                  <div key={donation.id}>
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-semibold text-emerald-950">
                          {donation.isAnonymous ? "Hamba Allah" : donation.donorName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-700">
                        {formatCurrency(donation.amount)}
                      </p>
                    </div>
                    <Separator className="bg-emerald-100 last:hidden" />
                  </div>
                ))}
              </div>
            )}
          </details>

          <LinkedGalleryViewer galleries={linkedGalleries} />
        </div>

        <aside className="hidden lg:sticky lg:top-[calc(var(--home-nav-height)+4rem)] lg:block lg:border-l lg:border-emerald-100 lg:pl-8">
          <section className="sm:py-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tight capitalize text-emerald-950">
              {campaign.title}
            </h1>

            <div className="mt-6">
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1 text-slate-500">
                <p className="text-2xl font-bold tracking-tight text-emerald-950">
                  {formatCurrency(collectedAmount)}
                </p>
                <p className="pb-0.5 text-sm text-slate-500">terkumpul dari</p>
                <p className="text-lg font-semibold text-emerald-900">
                  {formatCurrency(campaign.targetAmount)}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-base font-semibold text-emerald-900">{progress}%</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-emerald-100 pt-6 text-center">
              <div>
                <Users className="mx-auto h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-base font-semibold text-emerald-950">{donationCount}</p>
                <p className="text-sm text-slate-500">Donatur</p>
              </div>
              <div>
                <CalendarDays className="mx-auto h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-base font-semibold text-emerald-950">{daysLeftLabel}</p>
                <p className="text-sm text-slate-500">Periode</p>
              </div>
            </div>

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-emerald-900 py-6 text-base hover:bg-emerald-800"
                asChild
              >
                <Link href={`/donasi/${campaign.slug}/bayar`}>Donasi Sekarang</Link>
              </Button>
            </div>
          </section>
        </aside>
      </div>
      <MobileDonationStickyBar
        slug={campaign.slug}
      />
    </div>
  );
}
