import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDonationCampaignUpdateHref,
  isDonationCampaignUpdateSchemaMismatchError,
} from "@/lib/donation-campaign-updates";
import { MobileDonationStickyBar } from "@/components/mobile-donation-sticky-bar";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";
import prisma from "@/lib/prisma";
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
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    tags: string[];
    category: {
      name: string;
      slug: string;
    } | null;
  }>;
} | null;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.donationCampaign.findUnique({
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
    campaign = await prisma.donationCampaign.findUnique({
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
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            createdAt: true,
            tags: true,
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

    campaign = await prisma.donationCampaign.findUnique({
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

  const profile = await getMasjidProfileData();

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
              <h2 className="text-lg font-semibold text-emerald-950">Penyelenggara</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900 text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-emerald-950">{profile.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    <span>Verified Organization</span>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <details className="mt-7 rounded-[26px] border border-emerald-100 bg-white p-5" open>
            <summary className="cursor-pointer list-none text-2xl font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Deskripsi Program</span>
                <span className="text-sm font-medium text-emerald-700">Lihat</span>
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

          <details className="mt-6 rounded-[26px] border border-emerald-100 bg-white p-5">
            <summary className="cursor-pointer list-none text-2xl font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Update Terbaru</span>
                <span className="text-sm font-medium text-emerald-700">
                  {updates.length === 0 ? "Kosong" : "Lihat"}
                </span>
              </div>
            </summary>
            {updates.length === 0 ? (
              <div className="mt-4 text-base leading-8 text-slate-700">Belum ada update.</div>
            ) : (
              <div className="mt-6 space-y-8">
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

                      <div className="mt-3 rounded-[26px] bg-slate-50 p-4 sm:p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                          {article.coverImage ? (
                            <div className="relative w-full shrink-0 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 md:w-[320px]">
                              <Image
                                src={article.coverImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-semibold leading-tight text-emerald-950">
                              {article.title}
                            </h3>

                            <p className="mt-4 text-base leading-8 text-slate-700">
                              {article.excerpt ||
                                "Lihat berita lengkap untuk mengetahui perkembangan terbaru dari kampanye ini."}
                            </p>

                            <Link
                              href={href}
                              className="mt-3 inline-flex items-center gap-2 text-lg font-medium text-sky-600 transition hover:text-sky-700"
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

          <details id="donatur" className="mt-6 rounded-[26px] border border-emerald-100 bg-white p-5">
            <summary className="cursor-pointer list-none text-2xl font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Donatur</span>
                <span className="text-sm font-medium text-emerald-700">
                  {campaign.donations.length === 0 ? "Kosong" : "Lihat"}
                </span>
              </div>
            </summary>
            {campaign.donations.length === 0 ? (
              <div className="mt-4 text-sm text-slate-500">
                Belum ada donasi tercatat untuk kampanye ini.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {campaign.donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-4"
                  >
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
                ))}
              </div>
            )}
          </details>
        </div>

        <aside className="hidden lg:sticky lg:top-[calc(var(--home-nav-height)+1.5rem)] lg:block lg:border-l lg:border-emerald-100 lg:pl-8">
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

          <section className="mt-8 border-t border-emerald-100 pt-8">
            <h2 className="text-2xl font-semibold text-emerald-950">Penggalang Dana</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 text-white">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-semibold text-emerald-950">{profile.name}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  <span>Verified Organization</span>
                </div>
              </div>
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
