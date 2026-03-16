"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardCampaignCreateForm } from "@/components/dashboard-campaign-create-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export type DashboardCampaignLinkedArticle = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
};

export type DashboardCampaignItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  collectedAmount: number;
  progress: number;
  donationCount: number;
  isActive: boolean;
  endDate: string | null;
  createdAt: string;
  linkedArticles: DashboardCampaignLinkedArticle[];
};

export type DashboardDonationItem = {
  id: string;
  orderId: string;
  donorName: string;
  amount: number;
  paymentType: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CHALLENGE" | "CANCELED";
  createdAt: string;
  campaignId: string | null;
  campaignTitle: string | null;
};

type DashboardDonationManagementProps = {
  mode: "donations" | "campaigns";
  initialCampaigns: DashboardCampaignItem[];
  initialDonations: DashboardDonationItem[];
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  SUCCESS: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
  CHALLENGE: "Challenge",
  CANCELED: "Canceled",
};

function getStatusClass(status: DashboardDonationItem["status"]) {
  if (status === "SUCCESS") return "bg-green-100 text-green-700";
  if (status === "FAILED") return "bg-red-100 text-red-700";
  if (status === "EXPIRED") return "bg-amber-100 text-amber-700";
  if (status === "CHALLENGE") return "bg-orange-100 text-orange-700";
  if (status === "CANCELED") return "bg-slate-200 text-slate-700";
  return "bg-yellow-100 text-yellow-700";
}

function isManualBsiTransfer(paymentType: string | null) {
  return (paymentType ?? "").toLowerCase().includes("bsi");
}

function getDateRange() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return { todayStart, weekStart, monthStart };
}

function calculateProgress(collectedAmount: number, targetAmount: number) {
  if (!targetAmount || targetAmount <= 0) return 0;
  return Math.min(100, Math.round((collectedAmount / targetAmount) * 100));
}

export function DashboardDonationManagement({
  mode,
  initialCampaigns,
  initialDonations,
}: DashboardDonationManagementProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [donations, setDonations] = useState(initialDonations);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isCreatingManualDonation, setIsCreatingManualDonation] = useState(false);
  const [approvingDonationId, setApprovingDonationId] = useState<string | null>(null);
  const [cancelingDonationId, setCancelingDonationId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [manualCampaignId, setManualCampaignId] = useState("__general__");
  const [isManualAnonymous, setIsManualAnonymous] = useState(false);
  const [search, setSearch] = useState("");
  const isDonationMode = mode === "donations";
  const isCampaignMode = mode === "campaigns";

  function handleCampaignCreated(campaign: DashboardCampaignItem) {
    setCampaigns((prev) => [campaign, ...prev]);
    setIsCreateDialogOpen(false);
  }

  const donationStats = useMemo(() => {
    const successDonations = donations.filter((item) => item.status === "SUCCESS");
    const { todayStart, weekStart, monthStart } = getDateRange();

    let today = 0;
    let week = 0;
    let month = 0;
    let total = 0;

    for (const donation of successDonations) {
      const createdAt = new Date(donation.createdAt);
      const amount = donation.amount;

      total += amount;
      if (createdAt >= monthStart) month += amount;
      if (createdAt >= weekStart) week += amount;
      if (createdAt >= todayStart) today += amount;
    }

    return { today, week, month, total };
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return donations.filter((donation) => {
      if (statusFilter !== "__all__" && donation.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        donation.orderId.toLowerCase().includes(query) ||
        donation.donorName.toLowerCase().includes(query) ||
        (donation.campaignTitle || "").toLowerCase().includes(query)
      );
    });
  }, [donations, statusFilter, search]);

  async function handleApproveDonation(donation: DashboardDonationItem) {
    const confirmed = window.confirm(
      `Approve donasi ${donation.orderId} sebesar ${formatCurrency(donation.amount)}?`
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setApprovingDonationId(donation.id);

    try {
      const response = await fetch(`/api/donations/approve/${donation.id}`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal meng-approve donasi.");
      }

      setDonations((prev) =>
        prev.map((item) =>
          item.id === donation.id
            ? {
                ...item,
                status: "SUCCESS",
              }
            : item
        )
      );

      if (donation.campaignId) {
        setCampaigns((prev) =>
          prev.map((item) =>
            item.id === donation.campaignId
              ? {
                  ...item,
                  collectedAmount: item.collectedAmount + donation.amount,
                  donationCount: item.donationCount + 1,
                  progress: calculateProgress(
                    item.collectedAmount + donation.amount,
                    item.targetAmount
                  ),
                }
              : item
          )
        );
      }

      toast.success("Donasi transfer BSI berhasil di-approve.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal meng-approve donasi.");
    } finally {
      setApprovingDonationId(null);
    }
  }

  async function handleCancelDonation(donation: DashboardDonationItem) {
    const confirmed = window.confirm(`Batalkan donasi ${donation.orderId}?`);

    if (!confirmed) {
      return;
    }

    setActionError("");
    setCancelingDonationId(donation.id);

    try {
      const response = await fetch(`/api/donations/cancel/${donation.id}`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal membatalkan donasi.");
      }

      setDonations((prev) =>
        prev.map((item) =>
          item.id === donation.id
            ? {
                ...item,
                status: "CANCELED",
              }
            : item
        )
      );

      toast.success("Donasi berhasil dibatalkan.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal membatalkan donasi.");
    } finally {
      setCancelingDonationId(null);
    }
  }

  async function handleCreateManualDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setActionError("");
    setIsCreatingManualDonation(true);

    const formData = new FormData(form);
    const donorName = String(formData.get("donorName") || "").trim();
    const donorEmail = String(formData.get("donorEmail") || "").trim();
    const donorPhone = String(formData.get("donorPhone") || "").trim();
    const amount = Number(formData.get("amount"));
    const campaignId = manualCampaignId === "__general__" ? "" : manualCampaignId;
    const message = String(formData.get("message") || "").trim();
    const isAnonymous = formData.get("isAnonymous") === "on";

    if (!isAnonymous && donorName.length < 2) {
      setActionError("Nama donatur minimal 2 karakter.");
      setIsCreatingManualDonation(false);
      return;
    }

    if (!Number.isFinite(amount) || amount < 10000) {
      setActionError("Nominal donasi minimal Rp 10.000.");
      setIsCreatingManualDonation(false);
      return;
    }

    try {
      const response = await fetch("/api/donations/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: isAnonymous ? undefined : donorName,
          donorEmail: donorEmail || undefined,
          donorPhone: donorPhone || undefined,
          amount,
          campaignId: campaignId || undefined,
          message: message || undefined,
          isAnonymous,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menambahkan donasi manual.");
      }

      const created = result.data as {
        id: string;
        orderId: string;
        donorName: string;
        amount: number;
        paymentType: string | null;
        status: DashboardDonationItem["status"];
        createdAt: string;
        campaign: { id: string; title: string } | null;
      };

      setDonations((prev) => [
        {
          id: created.id,
          orderId: created.orderId,
          donorName: isAnonymous ? "Hamba Allah" : created.donorName,
          amount: created.amount,
          paymentType: created.paymentType,
          status: created.status,
          createdAt: created.createdAt,
          campaignId: created.campaign?.id ?? null,
          campaignTitle: created.campaign?.title ?? null,
        },
        ...prev,
      ]);

      if (created.campaign?.id) {
        setCampaigns((prev) =>
          prev.map((item) =>
            item.id === created.campaign?.id
              ? {
                  ...item,
                  collectedAmount: item.collectedAmount + created.amount,
                  donationCount: item.donationCount + 1,
                  progress: calculateProgress(item.collectedAmount + created.amount, item.targetAmount),
                }
              : item
          )
        );
      }

      form.reset();
      setManualCampaignId("__general__");
      setIsManualAnonymous(false);
      toast.success("Donasi manual berhasil ditambahkan.");
      setIsManualFormOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menambahkan donasi manual.");
    } finally {
      setIsCreatingManualDonation(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {isDonationMode ? "Transaksi Donasi" : "Kampanye Donasi"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDonationMode
              ? "Monitoring transaksi donasi, status pembayaran, dan input donasi manual."
              : "Kelola kampanye donasi, target, status, dan berita update yang tertaut."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDonationMode ? (
            <Dialog
              open={isManualFormOpen}
              onOpenChange={(open) => {
                setIsManualFormOpen(open);
                if (!open) {
                  setManualCampaignId("__general__");
                  setIsManualAnonymous(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">+ Donasi Manual</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Tambah Donasi Manual</DialogTitle>
                  <DialogDescription>
                    Input donasi yang masuk di luar web dan hubungkan ke kampanye yang sesuai.
                  </DialogDescription>
                </DialogHeader>

                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateManualDonation}>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Nama Donatur</label>
                    <input
                      name="donorName"
                      required={!isManualAnonymous}
                      minLength={isManualAnonymous ? undefined : 2}
                      disabled={isManualAnonymous}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      placeholder={isManualAnonymous ? "Akan disimpan sebagai Hamba Allah" : "Nama donatur"}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Nominal</label>
                    <input
                      type="number"
                      name="amount"
                      required
                      min={10000}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      name="donorEmail"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="opsional"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Nomor HP</label>
                    <input
                      name="donorPhone"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="opsional"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Kampanye</label>
                    <Select value={manualCampaignId} onValueChange={setManualCampaignId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kampanye" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__general__">Donasi Umum</SelectItem>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Catatan</label>
                    <textarea
                      name="message"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Catatan transfer manual, sumber donasi, dll"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={isManualAnonymous}
                      onChange={(event) => setIsManualAnonymous(event.target.checked)}
                      className="rounded border-input"
                    />
                    <span>Tampilkan sebagai Hamba Allah</span>
                  </label>
                  <div className="flex justify-end gap-3 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setIsManualFormOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={isCreatingManualDonation}>
                      {isCreatingManualDonation ? "Menyimpan..." : "Simpan Donasi Manual"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
          {isCampaignMode ? (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>+ Buat Kampanye</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-6xl" showCloseButton>
                <DialogHeader className="border-b px-6 py-5">
                  <DialogTitle>Buat Kampanye</DialogTitle>
                  <DialogDescription>
                    Susun kampanye baru dengan cover, judul, deskripsi, dan pengaturan donasi.
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-6">
                  <DashboardCampaignCreateForm
                    variant="dialog"
                    onCreated={handleCampaignCreated}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {isDonationMode ? (
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Hari Ini</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(donationStats.today)}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Minggu Ini</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(donationStats.week)}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Bulan Ini</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(donationStats.month)}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Keseluruhan</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(donationStats.total)}
            </p>
          </div>
        </section>
      ) : null}

      {isCampaignMode ? (
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Daftar Kampanye</h2>
        {campaigns.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
            Belum ada kampanye.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="group overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-full flex-col md:grid md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:items-start md:gap-4 md:p-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-[22px] bg-muted md:rounded-[14px]">
                    {campaign.coverImage ? (
                      <Image
                        src={campaign.coverImage}
                        alt={campaign.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No Cover
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                          campaign.isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-white/90 text-slate-700"
                        }`}
                      >
                        {campaign.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                        {campaign.donationCount} donasi
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 p-4 pt-3 md:p-0">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-slate-900 capitalize md:min-h-[3.5rem] md:text-lg">
                        {campaign.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                        {campaign.progress}%
                      </span>
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                      <p className="text-sm font-bold tracking-tight text-slate-900 md:text-[1.1rem]">
                        {formatCurrency(campaign.collectedAmount)}
                      </p>
                      <p className="pb-0.5 text-[10px] text-slate-500 md:text-xs">
                        dari {formatCurrency(campaign.targetAmount)}
                      </p>
                    </div>

                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-slate-500 md:text-xs">
                      <span>{campaign.donationCount} donasi sukses</span>
                      <span>{campaign.endDate ? formatDateTime(campaign.endDate) : "Tanpa batas"}</span>
                    </div>

                    <div className="mt-4">
                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/kampanye/${campaign.id}`}>Kelola Kampanye</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      ) : null}

      {isDonationMode ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Transaksi Donasi</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 rounded-md px-3 text-sm">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Semua Status</SelectItem>
                <SelectItem value="SUCCESS">Berhasil</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="FAILED">Gagal</SelectItem>
                <SelectItem value="EXPIRED">Kadaluarsa</SelectItem>
                <SelectItem value="CHALLENGE">Challenge</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <input
            type="text"
            placeholder="Cari order id / donatur / kampanye..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex h-9 w-72 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Order ID</th>
                <th className="p-4 text-left font-medium">Donatur</th>
                <th className="p-4 text-left font-medium">Kampanye</th>
                <th className="p-4 text-right font-medium">Jumlah</th>
                <th className="p-4 text-left font-medium">Metode</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Tanggal</th>
                <th className="p-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Tidak ada data donasi untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="border-b last:border-b-0">
                    <td className="p-4 font-mono text-xs">{donation.orderId}</td>
                    <td className="p-4">{donation.donorName}</td>
                    <td className="p-4">{donation.campaignTitle || "-"}</td>
                    <td className="p-4 text-right font-semibold">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="p-4">{donation.paymentType || "-"}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClass(
                          donation.status
                        )}`}
                      >
                        {statusLabel[donation.status]}
                      </span>
                    </td>
                    <td className="p-4">{formatDateTime(donation.createdAt)}</td>
                    <td className="p-4 text-right">
                      {donation.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          {isManualBsiTransfer(donation.paymentType) ? (
                            <Button
                              size="sm"
                              disabled={approvingDonationId === donation.id}
                              onClick={() => handleApproveDonation(donation)}
                            >
                              {approvingDonationId === donation.id ? "Approving..." : "Approve"}
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={cancelingDonationId === donation.id}
                            onClick={() => handleCancelDonation(donation)}
                          >
                            {cancelingDonationId === donation.id ? "Canceling..." : "Cancel"}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}
    </div>
  );
}
