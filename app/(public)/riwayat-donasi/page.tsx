import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import dbQuery from "@/lib/data/db-query";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Riwayat Donasi",
};

function getStatusMeta(status: string) {
  switch (status) {
    case "SUCCESS":
      return {
        label: "Berhasil",
        className: "bg-green-100 text-green-700",
      };
    case "FAILED":
      return {
        label: "Gagal",
        className: "bg-red-100 text-red-700",
      };
    case "EXPIRED":
      return {
        label: "Kadaluarsa",
        className: "bg-amber-100 text-amber-700",
      };
    case "CANCELED":
      return {
        label: "Dibatalkan",
        className: "bg-slate-200 text-slate-700",
      };
    case "CHALLENGE":
      return {
        label: "Verifikasi",
        className: "bg-orange-100 text-orange-700",
      };
    default:
      return {
        label: "Menunggu",
        className: "bg-yellow-100 text-yellow-700",
      };
  }
}

function getPaymentLabel(paymentType: string | null) {
  const normalized = (paymentType ?? "").toLowerCase();

  if (normalized.includes("qris")) {
    return "QRIS";
  }

  if (normalized.includes("bank_transfer") || normalized.includes("manual_bank")) {
    return "Transfer Bank";
  }

  return paymentType || "-";
}

export default async function RiwayatDonasiPage() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(headerStore),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const donations = await dbQuery.donation.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const totalAmount = donations
    .filter((item) => item.status === "SUCCESS")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <section className="space-y-8 py-4">
        <div className="space-y-3 border-b border-emerald-100 pb-6">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
            Akun Saya
          </span>
          <h1 className="text-3xl font-bold text-emerald-950">Riwayat Donasi</h1>
          <p className="max-w-3xl text-slate-600">
            Semua donasi yang dibuat menggunakan akun ini akan muncul di sini.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/50 p-6">
            <p className="text-sm text-slate-500">Total Donasi Berhasil</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
            <p className="text-sm text-slate-500">Jumlah Transaksi</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">{donations.length}</p>
          </div>
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
            <p className="text-sm text-slate-500">Akun</p>
            <p className="mt-2 text-lg font-semibold text-emerald-950">{session.user.name}</p>
            <p className="mt-1 text-sm text-slate-600">{session.user.email}</p>
          </div>
        </div>

        {donations.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
            <h2 className="text-xl font-semibold text-emerald-950">Belum ada riwayat donasi</h2>
            <p className="mt-2 text-slate-600">
              Donasi yang dibuat saat login dengan akun ini akan muncul di halaman ini.
            </p>
            <Link
              href="/donasi"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Mulai Donasi
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            {donations.map((donation) => {
              const statusMeta = getStatusMeta(donation.status);

              return (
                <article
                  key={donation.id}
                  className="rounded-[28px] border border-emerald-100 bg-white p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="font-mono text-sm text-slate-500">{donation.orderId}</span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Nominal
                          </p>
                          <p className="mt-1 text-lg font-semibold text-emerald-950">
                            {formatCurrency(donation.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Metode
                          </p>
                          <p className="mt-1 text-sm font-medium text-emerald-950">
                            {getPaymentLabel(donation.paymentType)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Campaign
                          </p>
                          <p className="mt-1 text-sm font-medium text-emerald-950">
                            {donation.campaign?.title ?? "Donasi Umum"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Tanggal
                          </p>
                          <p className="mt-1 text-sm font-medium text-emerald-950">
                            {formatDateTime(donation.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      <Link
                        href={`/donasi/status?order_id=${encodeURIComponent(donation.orderId)}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
                      >
                        Lihat Status
                      </Link>
                      {donation.campaign?.slug ? (
                        <Link
                          href={`/donasi/${donation.campaign.slug}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
                        >
                          Lihat Campaign
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </div>
  );
}
