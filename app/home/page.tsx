import { Button } from "@/components/ui/button";
import { HomeContentTabs } from "@/components/home-content-tabs";
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
import prisma from "@/lib/prisma";
import { getPublicArticleType, publicArticleSelect } from "@/lib/public-articles";
import { stripHtmlTags } from "@/lib/article-content";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";
import { formatCurrency, formatDate, truncateText } from "@/lib/utils";
import {
  Heart,
  ArrowRight,
} from "lucide-react";

// ============================================================
// Homepage - masjidcontoh.com
// ============================================================

export const dynamic = "force-dynamic";

const SPECIAL_CAMPAIGN_SLUG = "pembangunan-masjid-masjidpusatsolusi";
const MAX_HOME_CAMPAIGNS = 4;

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

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
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
  if (!endDate) return "Tanpa batas waktu";

  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Berakhir";

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} hari lagi`;
}

export default async function HomePage() {
  const [campaigns, specialCampaignRaw, profile, latestArticles] = await Promise.all([
    prisma.donationCampaign.findMany({
      where: { isActive: true },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: {
            amount: true,
            donorName: true,
            isAnonymous: true,
          },
          orderBy: { amount: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: MAX_HOME_CAMPAIGNS,
    }),
    prisma.donationCampaign.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: SPECIAL_CAMPAIGN_SLUG },
          { title: { contains: "pembangunan masjid", mode: "insensitive" } },
          { title: { contains: "masjidpusatsolusi", mode: "insensitive" } },
        ],
      },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: {
            amount: true,
            donorName: true,
            isAnonymous: true,
          },
          orderBy: { amount: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getMasjidProfileData(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: publicArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
  ]);

  const latestHomeContentItems = latestArticles.slice(0, 3).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    coverImage: article.coverImage,
    excerpt: article.excerpt?.trim()
      ? article.excerpt
      : truncateText(stripHtmlTags(article.content), 160),
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    readingTime: getReadingTime(article.content),
    type: getPublicArticleType(article),
  }));
  const displayedArticles =
    latestHomeContentItems.length > 0 ? latestHomeContentItems : latestArticles.slice(0, 3);

  const donationCampaigns = campaigns.map((campaign) => {
    const collectedAmount = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
    const progress =
      campaign.targetAmount > 0
        ? Math.min(100, Math.round((collectedAmount / campaign.targetAmount) * 100))
        : 0;

    return {
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      coverImage: campaign.coverImage,
      targetAmount: campaign.targetAmount,
      collectedAmount,
      progress,
      endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
      supporters: Array.from(
        campaign.donations.reduce((acc, donation) => {
          const name = donation.isAnonymous ? "Hamba Allah" : donation.donorName;
          const current = acc.get(name) ?? 0;
          acc.set(name, current + donation.amount);
          return acc;
        }, new Map<string, number>())
      )
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount]) => ({
          name,
          amount,
        })),
    };
  });

  const specialCampaign = (() => {
    if (specialCampaignRaw) {
      const collectedAmount = specialCampaignRaw.donations.reduce(
        (sum, d) => sum + d.amount,
        0
      );
      const progress =
        specialCampaignRaw.targetAmount > 0
          ? Math.min(
              100,
              Math.round((collectedAmount / specialCampaignRaw.targetAmount) * 100)
            )
          : 0;

      return {
        id: specialCampaignRaw.id,
        slug: specialCampaignRaw.slug,
        title: specialCampaignRaw.title,
        description: specialCampaignRaw.description,
        coverImage: specialCampaignRaw.coverImage,
        targetAmount: specialCampaignRaw.targetAmount,
        collectedAmount,
        progress,
        endDate: specialCampaignRaw.endDate ? specialCampaignRaw.endDate.toISOString() : null,
        supporters: Array.from(
          specialCampaignRaw.donations.reduce((acc, donation) => {
            const name = donation.isAnonymous ? "Hamba Allah" : donation.donorName;
            const current = acc.get(name) ?? 0;
            acc.set(name, current + donation.amount);
            return acc;
          }, new Map<string, number>())
        )
          .sort((a, b) => b[1] - a[1])
          .map(([name, amount]) => ({
            name,
            amount,
          })),
      };
    }

    if (donationCampaigns.length > 0) {
      return donationCampaigns[0];
    }

    return {
      id: null,
      slug: null,
      title: "Pembangunan Masjid Ahlul Qur'an",
      description:
        "Kampanye utama untuk mewujudkan markas dakwah Masjid Ahlul Qur'an bersama Gerakan Semilyar Tangan. Setiap kontribusi diikhtiarkan menjadi amal jariyah yang terus mengalir.",
      coverImage: null,
      targetAmount: 1_500_000_000,
      collectedAmount: 0,
      progress: 0,
      endDate: null,
      supporters: [],
    };
  })();

  const heroTitle = "Pembangunan Masjid Ahlul Qur'an #MasjidPusatSolusi";

  const ctaMasonryItems = [
    {
      title: "Program Dakwah",
      image: donationCampaigns[0]?.coverImage || "/Gambar-masjid.png",
      className: "h-44",
    },
    {
      title: "Markas Ibadah",
      image: specialCampaign.coverImage || "/Gambar-masjid.png",
      className: "h-44",
    },
    {
      title: "Ruang Tumbuh",
      image: displayedArticles[0]?.coverImage || "/Gambar-masjid.png",
      className: "h-44",
    },
    {
      title: "Gerakan Umat",
      image: donationCampaigns[1]?.coverImage || "/Gambar-masjid.png",
      className: "h-44",
    },
    {
      title: "Pembinaan",
      image: displayedArticles[1]?.coverImage || "/Gambar-masjid.png",
      className: "h-44",
    },
    {
      title: "Pelayanan Sosial",
      image: donationCampaigns[2]?.coverImage || "/Gambar-masjid.png",
      className: "h-44",
    },
  ];

  const heroDescription = [
    `Kampanye utama untuk mewujudkan markas dakwah ${profile.name}.`,
    "Diarahkan menjadi pusat ibadah, pendidikan, dan pemberdayaan umat yang inklusif serta berkelanjutan.",
    "Setiap kontribusi diikhtiarkan menjadi amal jariyah yang terus mengalir.",
  ].join(" ");

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative mt-[var(--home-nav-height)] w-full min-h-[calc(85vh-var(--home-nav-height))] overflow-hidden">
        <Image
          src="/Gambar-masjid.png"
          alt={specialCampaign.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/10" />
        <div className="absolute inset-0 bg-[radial-gradient(135%_100%_at_18%_22%,rgba(16,112,74,0.94)_0%,rgba(16,112,74,0.76)_32%,rgba(16,112,74,0.5)_60%,rgba(16,112,74,0.18)_84%,rgba(16,112,74,0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(8,76,53,0.68)_0%,rgba(8,76,53,0.38)_46%,rgba(8,76,53,0.14)_74%,rgba(8,76,53,0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,70,44,0.56)_0%,rgba(5,70,44,0.26)_28%,rgba(5,70,44,0)_56%)]" />

        <div className="relative z-10 mx-auto flex h-full min-h-[calc(85vh-var(--home-nav-height))] w-full max-w-7xl items-center px-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-3">
              <p className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                {profile.foundationName}
              </p>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 sm:text-base">
              {heroDescription}
            </p>

            <div className="mt-6 max-w-xl space-y-2">
              <div className="flex items-center justify-between text-sm text-white">
                <span className="font-semibold">
                  {formatCurrency(specialCampaign.collectedAmount)}
                </span>
                <span className="text-white/75">
                  dari {formatCurrency(specialCampaign.targetAmount)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${specialCampaign.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/75">
                <span>{specialCampaign.progress}% terkumpul</span>
                <span>
                  {specialCampaign.endDate
                    ? `Sampai ${formatDate(specialCampaign.endDate)}`
                    : "Tanpa batas waktu"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full bg-white px-8 text-emerald-950 shadow-[0_16px_40px_rgba(255,255,255,0.16)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-[0_22px_50px_rgba(255,255,255,0.22)]"
                asChild
              >
                <Link
                  href={
                    specialCampaign.slug
                      ? `/donasi/${specialCampaign.slug}`
                      : "/donasi"
                  }
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Dukung {profile.movementName}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent px-8 text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-[0_18px_40px_rgba(5,70,44,0.24)]"
                asChild
              >
                <a href="/profil">Lihat Profil Markas</a>
              </Button>
            </div>
          </div>
        </div>

      </section>

      {/* ─── Program Donasi ─── */}
      <section className="pb-28 pt-24 sm:pb-32 sm:pt-32">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                Donasi
              </span>
              <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                Program Donasi Aktif
              </h2>
              <p className="mt-2 max-w-2xl text-emerald-900/70">
                Dukung pembangunan markas dakwah dan program umat dengan layout yang
                lebih fokus pada progres, donatur, dan aksi cepat.
              </p>
            </div>
            <Link
              href="/donasi"
              className="hidden items-center gap-1 text-sm font-semibold text-emerald-800 hover:text-emerald-900 sm:flex"
            >
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {donationCampaigns.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 lg:gap-5">
              {donationCampaigns.map((campaign) => {
                const visibleSupporters = campaign.supporters.slice(0, 5);
                const extraSupporters = Math.max(
                  campaign.supporters.length - visibleSupporters.length,
                  0
                );

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
          ) : (
            <div className="rounded-[22px] bg-emerald-50/55 px-6 py-10 text-center text-emerald-900/70">
              Program donasi aktif belum tersedia.
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/donasi" className="text-sm font-semibold text-emerald-800 hover:underline">
              Lihat Semua Program →
            </Link>
          </div>
        </div>
      </section>

      <HomeContentTabs items={latestHomeContentItems} />

      {/* ─── CTA Donasi ─── */}
      <section className="pb-40 pt-28 sm:pb-48 sm:pt-32">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:gap-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-balance text-emerald-950 md:text-4xl">
              Bangun markas dakwah lebih cepat dengan gerakan yang terarah
            </h2>
            <p className="mt-6 max-w-lg text-base text-emerald-900/70">
              Setiap kontribusi membantu {profile.name} bertumbuh menjadi pusat
              ibadah, dakwah, pendidikan, dan pelayanan umat. Dukungan hari ini
              menjadi fondasi program yang hidup untuk jangka panjang.
            </p>

            <Button
              size="lg"
              className="group mt-8 rounded-lg bg-emerald-900 px-5 py-6 text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.14)_inset] ring ring-white/20 ring-inset ring-offset-2 ring-offset-emerald-900 transition-all duration-200 hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.26)_inset] hover:ring-white/35"
              asChild
            >
              <Link href="/donasi">
                <span>Dukung Pembangunan</span>
                <ArrowRight className="mt-0.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="relative max-h-[35rem] overflow-hidden rounded-[1.75rem] bg-emerald-50/80 p-3 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <div className="grid h-full grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                {ctaMasonryItems.slice(0, 3).map((item) => (
                  <div
                    key={item.title}
                    className={`group relative overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 ${item.className}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,12,10,0.22)_0%,rgba(2,12,10,0.38)_34%,rgba(2,12,10,0.86)_100%)]" />
                    <div className="absolute inset-x-3 bottom-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3">
                {ctaMasonryItems.slice(3).map((item) => (
                  <div
                    key={item.title}
                    className={`group relative overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 ${item.className}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,12,10,0.22)_0%,rgba(2,12,10,0.38)_34%,rgba(2,12,10,0.86)_100%)]" />
                    <div className="absolute inset-x-3 bottom-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
