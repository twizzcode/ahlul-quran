import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Flag, Heart, Image as ImageIcon, Landmark, Plus, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { ADMIN_NAV_ITEMS, ADMIN_ROUTE_PATHS } from "@/lib/routing/admin-routes";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/src";
import { article, donation, donationCampaign, gallery, user } from "@/src/db/schema";

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

const moduleMeta: Record<string, { description: string; icon: LucideIcon }> = {
  Dashboard: {
    description: "Ringkasan performa admin, trafik konten, dan aktivitas donasi terbaru.",
    icon: Landmark,
  },
  "Berita dan Artikel": {
    description: "Kelola berita, artikel kajian, dan update kampanye publik.",
    icon: BookOpen,
  },
  Donasi: {
    description: "Pantau transaksi masuk, approval manual, dan status pembayaran.",
    icon: Heart,
  },
  Kampanye: {
    description: "Atur campaign aktif, target, progres, dan relasi ke berita.",
    icon: Flag,
  },
  Galeri: {
    description: "Rapikan dokumentasi visual kegiatan agar halaman publik tetap segar.",
    icon: ImageIcon,
  },
  Homepage: {
    description: "Edit hero, branding, banner, dan narasi utama khusus halaman home.",
    icon: Landmark,
  },
  Profile: {
    description: "Perbarui profil publik, visi, kontak, dan data operasional masjid.",
    icon: Landmark,
  },
  Pengguna: {
    description: "Kelola akun pengelola dan role yang berhak masuk admin.",
    icon: Users,
  },
};

export default async function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    articleCountResult,
    activeCampaignCountResult,
    galleryCountResult,
    userCountResult,
    monthlyDonationAggregate,
    monthlyDonationCountResult,
    recentArticles,
    recentDonations,
  ] = await Promise.all([
    db.select({ value: count() }).from(article),
    db.select({ value: count() }).from(donationCampaign).where(eq(donationCampaign.isActive, true)),
    db.select({ value: count() }).from(gallery),
    db.select({ value: count() }).from(user),
    db
      .select({ value: sql<number>`coalesce(sum(${donation.amount}), 0)` })
      .from(donation)
      .where(and(eq(donation.status, "SUCCESS"), gte(donation.createdAt, startOfMonth))),
    db.select({ value: count() }).from(donation).where(and(eq(donation.status, "SUCCESS"), gte(donation.createdAt, startOfMonth))),
    db.query.article.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: [desc(article.publishedAt), desc(article.createdAt)],
      limit: 4,
      where: isNotNull(article.id),
    }),
    db.query.donation.findMany({
      columns: {
        id: true,
        donorName: true,
        amount: true,
        createdAt: true,
      },
      where: eq(donation.status, "SUCCESS"),
      orderBy: [desc(donation.createdAt)],
      limit: 4,
    }),
  ]);

  const articleCount = articleCountResult[0]?.value ?? 0;
  const activeCampaignCount = activeCampaignCountResult[0]?.value ?? 0;
  const galleryCount = galleryCountResult[0]?.value ?? 0;
  const userCount = userCountResult[0]?.value ?? 0;
  const monthlyDonationAmount = Number(monthlyDonationAggregate[0]?.value ?? 0);
  const monthlyDonationCount = monthlyDonationCountResult[0]?.value ?? 0;

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
      value: formatCurrency(monthlyDonationAmount),
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
      href: `${ADMIN_ROUTE_PATHS.artikelCreate}?type=artikel`,
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
    (item) => item.url !== ADMIN_ROUTE_PATHS.dashboard,
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
            <span className="rounded-full bg-emerald-50 px-3 py-1.5">{moduleCards.length} modul aktif</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">{monthlyDonationCount} donasi sukses bulan ini</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">Diperbarui {formatDate(now)}</span>
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
                {formatCurrency(monthlyDonationAmount)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-sm text-slate-500">Campaign aktif</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{activeCampaignCount}</p>
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
                  Data di halaman ini dibaca dari schema aktif Drizzle dan session Better Auth yang sekarang.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{stat.helper}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Modul Admin</h2>
              <p className="text-sm text-slate-500">Peta cepat modul yang tersedia di dashboard saat ini.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {moduleCards.map((item) => {
              const meta = moduleMeta[item.title];
              const Icon = meta.icon;
              return (
                <Link key={item.url} href={item.url} className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{meta.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Artikel Terbaru</h2>
            <div className="mt-4 space-y-3">
              {recentArticles.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500">Belum ada artikel.</div>
              ) : (
                recentArticles.map((item) => (
                  <Link key={item.id} href={`/artikel//edit`} className="block rounded-2xl border p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.publishedAt ?? item.createdAt)}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Donasi Sukses Terbaru</h2>
            <div className="mt-4 space-y-3">
              {recentDonations.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500">Belum ada donasi sukses.</div>
              ) : (
                recentDonations.map((item) => (
                  <div key={item.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.donorName}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                      </div>
                      <p className="font-semibold text-emerald-700">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
