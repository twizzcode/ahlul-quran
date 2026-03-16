import Link from "next/link";
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

export default async function DashboardPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    articleCount,
    activeCampaignCount,
    galleryCount,
    userCount,
    monthlyDonationAggregate,
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
      helper: "Semua konten artikel",
      href: ADMIN_ROUTE_PATHS.artikel,
    },
    {
      label: "Campaign Aktif",
      value: activeCampaignCount.toString(),
      helper: "Donasi yang masih berjalan",
      href: ADMIN_ROUTE_PATHS.kampanye,
    },
    {
      label: "Donasi Bulan Ini",
      value: formatCurrency(monthlyDonationAggregate._sum.amount ?? 0),
      helper: "Akumulasi donasi sukses",
      href: ADMIN_ROUTE_PATHS.donasi,
    },
    {
      label: "Galeri",
      value: galleryCount.toString(),
      helper: "Konten galeri tersimpan",
      href: ADMIN_ROUTE_PATHS.galeri,
    },
    {
      label: "Total Pengguna",
      value: userCount.toString(),
      helper: "Semua akun terdaftar",
      href: ADMIN_ROUTE_PATHS.pengguna,
    },
  ];

  const moduleCards = [...ADMIN_NAV_ITEMS.main, ...ADMIN_NAV_ITEMS.settings].filter(
    (item) => item.url !== ADMIN_ROUTE_PATHS.dashboard
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan cepat untuk modul admin yang aktif saat ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.helper}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold">Akses Cepat</h2>
          <p className="text-sm text-muted-foreground">
            Langsung menuju modul utama dashboard.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {moduleCards.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Artikel Terbaru</h2>
              <p className="text-sm text-muted-foreground">
                Konten terakhir yang masuk ke sistem.
              </p>
            </div>
            <Link
              href={ADMIN_ROUTE_PATHS.artikel}
              className="text-sm font-medium text-primary hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada artikel.</p>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/artikel/${article.slug}/edit`}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(article.publishedAt ?? article.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-primary">Edit</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Donasi Terbaru</h2>
              <p className="text-sm text-muted-foreground">
                Donasi sukses terbaru yang tercatat.
              </p>
            </div>
            <Link
              href={ADMIN_ROUTE_PATHS.donasi}
              className="text-sm font-medium text-primary hover:underline"
            >
              Buka donasi
            </Link>
          </div>

          {recentDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data donasi.</p>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium">{donation.donorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
