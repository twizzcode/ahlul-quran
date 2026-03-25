import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Flag,
  Heart,
  Image as ImageIcon,
  Landmark,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { ADMIN_NAV_ITEMS, ADMIN_ROUTE_PATHS } from "@/lib/admin-routes";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatMonth(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(value);
}

const moduleMeta: Record<
  string,
  {
    description: string;
    icon: LucideIcon;
  }
> = {
  Artikel: {
    description: "Kelola berita, artikel kajian, dan konten publikasi.",
    icon: BookOpen,
  },
  Donasi: {
    description: "Pantau transaksi masuk dan status donasi terbaru.",
    icon: Heart,
  },
  Kampanye: {
    description: "Atur campaign aktif, target, dan progres penggalangan.",
    icon: Flag,
  },
  Galeri: {
    description: "Rapikan dokumentasi foto agar tampilan website tetap segar.",
    icon: ImageIcon,
  },
  Profile: {
    description: "Perbarui identitas masjid dan informasi utama website.",
    icon: Landmark,
  },
  Pengguna: {
    description: "Kelola akun admin dan akses pengelola dashboard.",
    icon: Users,
  },
};

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    articleCount,
    activeCampaignCount,
    galleryCount,
    userCount,
    monthlyDonationAggregate,
    monthlyDonationCount,
    recentArticles,
    recentDonations,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.donationCampaign.count({ where: { isActive: true } }),
    prisma.gallery.count(),
    prisma.user.count(),
    prisma.donation.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.donation.count({
      where: {
        status: "SUCCESS",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.donation.findMany({
      where: { status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        donorName: true,
        amount: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Total Artikel",
      value: articleCount.toString(),
      helper: "Semua konten artikel dan berita",
      href: ADMIN_ROUTE_PATHS.artikel,
    },
    {
      label: "Campaign Aktif",
      value: activeCampaignCount.toString(),
      helper: "Program donasi yang sedang berjalan",
      href: ADMIN_ROUTE_PATHS.kampanye,
    },
    {
      label: "Donasi Bulan Ini",
      value: formatCurrency(monthlyDonationAggregate._sum.amount ?? 0),
      helper: "Akumulasi donasi sukses bulan berjalan",
      href: ADMIN_ROUTE_PATHS.donasi,
    },
    {
      label: "Galeri",
      value: galleryCount.toString(),
      helper: "Dokumentasi foto yang tersimpan",
      href: ADMIN_ROUTE_PATHS.galeri,
    },
    {
      label: "Total Pengguna",
      value: userCount.toString(),
      helper: "Akun yang memiliki akses ke sistem",
      href: ADMIN_ROUTE_PATHS.pengguna,
    },
  ];

  const quickActions = [
    {
      label: "Tulis Artikel",
      href: ADMIN_ROUTE_PATHS.artikelCreate,
      icon: Plus,
      accentClassName:
        "border-emerald-900 bg-emerald-900 text-white hover:bg-emerald-800 hover:border-emerald-800",
    },
    {
      label: "Buat Kampanye",
      href: ADMIN_ROUTE_PATHS.kampanyeCreate,
      icon: Sparkles,
      accentClassName:
        "border-emerald-200 bg-white text-emerald-950 hover:border-emerald-300 hover:bg-emerald-50/60",
    },
    {
      label: "Kelola Donasi",
      href: ADMIN_ROUTE_PATHS.donasi,
      icon: ArrowRight,
      accentClassName:
        "border-emerald-200 bg-white text-emerald-950 hover:border-emerald-300 hover:bg-emerald-50/60",
    },
  ];

  const moduleCards = [...ADMIN_NAV_ITEMS.main, ...ADMIN_NAV_ITEMS.settings].filter(
    (item) => item.url !== ADMIN_ROUTE_PATHS.dashboard
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm md:p-7">
          <p className="text-sm font-medium text-emerald-700">Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Ringkasan pengelolaan website masjid
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Lihat modul yang sedang aktif, donasi yang masuk bulan ini, dan akses cepat ke
            halaman yang paling sering dipakai tim admin.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5">
              {moduleCards.length} modul aktif
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              {monthlyDonationCount} donasi sukses bulan ini
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">
              Diperbarui {formatDate(now)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${action.accentClassName}`}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/55 p-6 shadow-sm">
          <p className="text-sm font-medium text-emerald-800">Ringkasan {formatMonth(now)}</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <p className="text-sm text-slate-500">Donasi bulan ini</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {formatCurrency(monthlyDonationAggregate._sum.amount ?? 0)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-sm text-slate-500">Campaign aktif</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {activeCampaignCount}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-sm text-slate-500">Pengguna admin</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{userCount}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Data di halaman ini diperbarui langsung dari artikel, donasi, kampanye, galeri,
                  dan akun pengguna yang ada di sistem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{stat.helper}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
              Buka modul
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Navigasi Cepat
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Modul utama dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Arahkan pekerjaan tim lebih cepat ke modul yang paling sering dipakai setiap
                hari.
              </p>
            </div>
            <Link
              href={ADMIN_ROUTE_PATHS.artikelCreate}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950"
            >
              Mulai dari artikel
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleCards.map((item) => {
              const meta = moduleMeta[item.title];
              const Icon = meta.icon;

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className="group rounded-[24px] border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold capitalize text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.title === "Artikel" &&
                          "Kelola berita, artikel kajian, dan konten publikasi."}
                        {item.title === "Donasi" &&
                          "Pantau transaksi masuk dan status donasi terbaru."}
                        {item.title === "Kampanye" &&
                          "Atur campaign aktif, target, dan progres penggalangan."}
                        {item.title === "Galeri" &&
                          "Rapikan dokumentasi foto agar tampilan website tetap segar."}
                        {item.title === "Profile" &&
                          "Perbarui identitas masjid dan informasi utama website."}
                        {item.title === "Pengguna" &&
                          "Kelola akun admin dan akses pengelola dashboard."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                    Buka modul
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Aktivitas Konten
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Artikel terbaru
                </h2>
              </div>
              <Link
                href={ADMIN_ROUTE_PATHS.artikel}
                className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
              >
                Lihat semua
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                Belum ada artikel yang masuk ke sistem.
              </div>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/artikel/${article.slug}/edit`}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 px-4 py-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/35"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-800">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold capitalize text-slate-950">
                        {article.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Dipublikasikan {formatDate(article.publishedAt ?? article.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-800" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Aktivitas Donasi
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Donasi terbaru
                </h2>
              </div>
              <Link
                href={ADMIN_ROUTE_PATHS.donasi}
                className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
              >
                Buka donasi
              </Link>
            </div>

            {recentDonations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                Belum ada data donasi sukses.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(250,250,250,0.7)_0%,rgba(255,255,255,1)_100%)] px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-semibold text-slate-950">
                        {donation.donorName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tercatat {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                      {formatCurrency(donation.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
