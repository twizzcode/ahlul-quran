"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { DashboardCampaignCreateForm } from "@/components/dashboard/donations/dashboard-campaign-create-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Check, Loader2, Pencil, Search, SlidersHorizontal, Trash2, X } from "lucide-react";

export type DashboardCampaignLinkedArticle = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
};

export type DashboardCampaignLinkedGallery = {
  id: string;
  title: string;
  createdAt: string;
  imageCount: number;
  coverImage: string | null;
};

export type DashboardCampaignGalleryOption = {
  id: string;
  title: string;
  createdAt: string;
  imageCount: number;
  coverImage: string | null;
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
  linkedGalleries: DashboardCampaignLinkedGallery[];
};

export type DashboardDonationItem = {
  id: string;
  orderId: string;
  donorName: string;
  donorEmail: string | null;
  donorPhone: string | null;
  amount: number;
  message: string | null;
  isAnonymous: boolean;
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
  galleryOptions?: DashboardCampaignGalleryOption[];
};

type DonationActionDialogState =
  | {
      type: "approve" | "delete";
      donation: DashboardDonationItem;
    }
  | null;

type DonationEditState = {
  donationId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: string;
  message: string;
  isAnonymous: boolean;
  campaignId: string;
} | null;

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
  galleryOptions = [],
}: DashboardDonationManagementProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [donations, setDonations] = useState(initialDonations);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isCreatingManualDonation, setIsCreatingManualDonation] = useState(false);
  const [approvingDonationId, setApprovingDonationId] = useState<string | null>(null);
  const [deletingDonationId, setDeletingDonationId] = useState<string | null>(null);
  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<DonationActionDialogState>(null);
  const [editDonation, setEditDonation] = useState<DonationEditState>(null);
  const [actionError, setActionError] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [manualCampaignId, setManualCampaignId] = useState("__general__");
  const [isManualAnonymous, setIsManualAnonymous] = useState(false);
  const [search, setSearch] = useState("");
  const [showExpiredCampaigns, setShowExpiredCampaigns] = useState(false);
  const [campaignDateSort, setCampaignDateSort] = useState<"newest" | "oldest">("newest");
  const isDonationMode = mode === "donations";
  const isCampaignMode = mode === "campaigns";

  function handleCampaignCreated(campaign: DashboardCampaignItem) {
    setCampaigns((prev) => [campaign, ...prev]);
    setIsCreateDialogOpen(false);
  }

  function updateCampaignTotals(
    previousDonation: DashboardDonationItem | null,
    nextDonation: DashboardDonationItem | null
  ) {
    setCampaigns((prev) =>
      prev.map((campaign) => {
        let collectedAmount = campaign.collectedAmount;
        let donationCount = campaign.donationCount;

        if (previousDonation?.status === "SUCCESS" && previousDonation.campaignId === campaign.id) {
          collectedAmount -= previousDonation.amount;
          donationCount -= 1;
        }

        if (nextDonation?.status === "SUCCESS" && nextDonation.campaignId === campaign.id) {
          collectedAmount += nextDonation.amount;
          donationCount += 1;
        }

        const safeCollectedAmount = Math.max(0, collectedAmount);
        const safeDonationCount = Math.max(0, donationCount);

        return {
          ...campaign,
          collectedAmount: safeCollectedAmount,
          donationCount: safeDonationCount,
          progress: calculateProgress(safeCollectedAmount, campaign.targetAmount),
        };
      })
    );
  }

  function openEditDonationDialog(donation: DashboardDonationItem) {
    setActionError("");
    setEditDonation({
      donationId: donation.id,
      donorName: donation.isAnonymous ? "" : donation.donorName,
      donorEmail: donation.donorEmail ?? "",
      donorPhone: donation.donorPhone ?? "",
      amount: String(donation.amount),
      message: donation.message ?? "",
      isAnonymous: donation.isAnonymous,
      campaignId: donation.campaignId ?? "__general__",
    });
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

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campaigns
      .filter((campaign) => {
        const isExpired =
          campaign.endDate !== null && new Date(campaign.endDate).getTime() <= Date.now();

        if (!showExpiredCampaigns && isExpired) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [campaign.title, campaign.description, campaign.slug].join(" ").toLowerCase().includes(query);
      })
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();
        return campaignDateSort === "newest" ? rightTime - leftTime : leftTime - rightTime;
      });
  }, [campaignDateSort, campaigns, search, showExpiredCampaigns]);

  async function handleApproveDonation(donation: DashboardDonationItem) {
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

      toast.success("Donasi berhasil di-approve.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal meng-approve donasi.");
    } finally {
      setApprovingDonationId(null);
      setActionDialog(null);
    }
  }

  async function handleDeleteDonation(donation: DashboardDonationItem) {
    setActionError("");
    setDeletingDonationId(donation.id);

    try {
      const response = await fetch(`/api/donations/${donation.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menghapus donasi.");
      }

      updateCampaignTotals(donation, null);
      setDonations((prev) => prev.filter((item) => item.id !== donation.id));

      toast.success("Donasi berhasil dihapus.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menghapus donasi.");
    } finally {
      setDeletingDonationId(null);
      setActionDialog(null);
    }
  }

  async function handleEditDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editDonation) {
      return;
    }

    const donation = donations.find((item) => item.id === editDonation.donationId);
    if (!donation) {
      setActionError("Donasi tidak ditemukan.");
      setEditDonation(null);
      return;
    }

    const donorName = editDonation.donorName.trim();
    const donorEmail = editDonation.donorEmail.trim();
    const donorPhone = editDonation.donorPhone.trim();
    const amount = Number(editDonation.amount);
    const campaignId = editDonation.campaignId === "__general__" ? "" : editDonation.campaignId;
    const message = editDonation.message.trim();

    if (!editDonation.isAnonymous && donorName.length < 2) {
      setActionError("Nama donatur minimal 2 karakter.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 10000) {
      setActionError("Nominal donasi minimal Rp 10.000.");
      return;
    }

    setActionError("");
    setEditingDonationId(donation.id);

    try {
      const response = await fetch(`/api/donations/${donation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: editDonation.isAnonymous ? undefined : donorName,
          donorEmail: donorEmail || undefined,
          donorPhone: donorPhone || undefined,
          amount,
          campaignId: campaignId || undefined,
          message: message || undefined,
          isAnonymous: editDonation.isAnonymous,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal memperbarui donasi.");
      }

      const updatedData = result.data as {
        id: string;
        orderId: string;
        donorName: string;
        donorEmail: string | null;
        donorPhone: string | null;
        amount: number;
        message: string | null;
        isAnonymous: boolean;
        paymentType: string | null;
        status: DashboardDonationItem["status"];
        createdAt: string;
        campaign: { id: string; title: string } | null;
      };

      const updatedDonation: DashboardDonationItem = {
        id: updatedData.id,
        orderId: updatedData.orderId,
        donorName: updatedData.isAnonymous ? "Hamba Allah" : updatedData.donorName,
        donorEmail: updatedData.donorEmail,
        donorPhone: updatedData.donorPhone,
        amount: updatedData.amount,
        message: updatedData.message,
        isAnonymous: updatedData.isAnonymous,
        paymentType: updatedData.paymentType,
        status: updatedData.status,
        createdAt: updatedData.createdAt,
        campaignId: updatedData.campaign?.id ?? null,
        campaignTitle: updatedData.campaign?.title ?? null,
      };

      updateCampaignTotals(donation, updatedDonation);
      setDonations((prev) =>
        prev.map((item) => (item.id === updatedDonation.id ? updatedDonation : item))
      );
      setEditDonation(null);
      toast.success("Donasi berhasil diperbarui.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal memperbarui donasi.");
    } finally {
      setEditingDonationId(null);
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
        donorEmail: string | null;
        donorPhone: string | null;
        amount: number;
        message: string | null;
        isAnonymous: boolean;
        paymentType: string | null;
        status: DashboardDonationItem["status"];
        createdAt: string;
        campaign: { id: string; title: string } | null;
      };

      setDonations((prev) => [
        {
          id: created.id,
          orderId: created.orderId,
          donorName: created.isAnonymous ? "Hamba Allah" : created.donorName,
          donorEmail: created.donorEmail,
          donorPhone: created.donorPhone,
          amount: created.amount,
          message: created.message,
          isAnonymous: created.isAnonymous,
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
    <div className="pt-6">
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
                    galleryOptions={galleryOptions}
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari judul / deskripsi / slug kampanye..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[240] min-w-[260px] rounded-2xl border-emerald-100 p-2">
              <DropdownMenuCheckboxItem
                indicatorPosition="right"
                checked={showExpiredCampaigns}
                onCheckedChange={(checked) => setShowExpiredCampaigns(checked)}
                className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
              >
                Tampilkan yang expired
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-emerald-100" />
              <DropdownMenuCheckboxItem
                indicatorPosition="right"
                checked={campaignDateSort === "oldest"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCampaignDateSort("oldest");
                  }
                }}
                className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
              >
                Dari yang terlama
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                indicatorPosition="right"
                checked={campaignDateSort === "newest"}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCampaignDateSort("newest");
                  }
                }}
                className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
              >
                Dari yang terbaru
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="py-6 text-sm text-muted-foreground">
            {search.trim() ? "Kampanye tidak ditemukan." : showExpiredCampaigns ? "Belum ada kampanye." : "Belum ada kampanye yang masih aktif."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {filteredCampaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="group overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-full flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
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

                  <div className="min-w-0 p-4 pt-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-bold leading-tight text-slate-900 capitalize">
                        {campaign.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                        {campaign.progress}%
                      </span>
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                      <p className="text-base font-bold tracking-tight text-slate-900">
                        {formatCurrency(campaign.collectedAmount)}
                      </p>
                      <p className="pb-0.5 text-[10px] text-slate-500">
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
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            disabled={editingDonationId === donation.id}
                            onClick={() => openEditDonationDialog(donation)}
                            aria-label={`Edit donasi ${donation.orderId}`}
                            title="Edit donasi"
                          >
                            {editingDonationId === donation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </Button>
                          {donation.status === "PENDING" ? (
                          <Button
                            size="icon-sm"
                            disabled={approvingDonationId === donation.id}
                            onClick={() => setActionDialog({ type: "approve", donation })}
                            aria-label={`Centang donasi ${donation.orderId}`}
                            title="Centang donasi"
                          >
                            {approvingDonationId === donation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          ) : null}
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            disabled={deletingDonationId === donation.id}
                            onClick={() => setActionDialog({ type: "delete", donation })}
                            aria-label={`Hapus donasi ${donation.orderId}`}
                            title="Hapus donasi"
                          >
                            {deletingDonationId === donation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AlertDialog open={actionDialog !== null} onOpenChange={(open) => !open && setActionDialog(null)}>
          <AlertDialogContent className="max-w-md p-6">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog?.type === "approve" ? "Approve donasi?" : "Hapus donasi?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionDialog
                  ? actionDialog.type === "approve"
                    ? `Donasi ${actionDialog.donation.orderId} sebesar ${formatCurrency(
                        actionDialog.donation.amount
                      )} akan ditandai berhasil.`
                    : `Donasi ${actionDialog.donation.orderId} akan dihapus permanen dari daftar.`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={
                  (actionDialog?.type === "approve" &&
                    approvingDonationId === actionDialog.donation.id) ||
                  (actionDialog?.type === "delete" &&
                    deletingDonationId === actionDialog.donation.id)
                }
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                className={actionDialog?.type === "delete" ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
                disabled={
                  actionDialog === null ||
                  (actionDialog.type === "approve" &&
                    approvingDonationId === actionDialog.donation.id) ||
                  (actionDialog.type === "delete" &&
                    deletingDonationId === actionDialog.donation.id)
                }
                onClick={(event) => {
                  event.preventDefault();

                  if (!actionDialog) {
                    return;
                  }

                  if (actionDialog.type === "approve") {
                    void handleApproveDonation(actionDialog.donation);
                    return;
                  }

                  void handleDeleteDonation(actionDialog.donation);
                }}
              >
                {actionDialog?.type === "approve"
                  ? approvingDonationId === actionDialog.donation.id
                    ? "Menyimpan..."
                    : "Approve"
                  : deletingDonationId === actionDialog?.donation.id
                    ? "Menghapus..."
                    : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={editDonation !== null} onOpenChange={(open) => !open && setEditDonation(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Donasi</DialogTitle>
              <DialogDescription>
                Ubah data donatur, nominal, dan kampanye yang terkait.
              </DialogDescription>
            </DialogHeader>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditDonation}>
              <div>
                <label className="mb-2 block text-sm font-medium">Nama Donatur</label>
                <input
                  name="donorName"
                  required={!editDonation?.isAnonymous}
                  minLength={editDonation?.isAnonymous ? undefined : 2}
                  disabled={editDonation?.isAnonymous || editingDonationId !== null}
                  value={editDonation?.donorName ?? ""}
                  onChange={(event) =>
                    setEditDonation((prev) => (prev ? { ...prev, donorName: event.target.value } : prev))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder={editDonation?.isAnonymous ? "Akan disimpan sebagai Hamba Allah" : "Nama donatur"}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Nominal</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min={10000}
                  disabled={editingDonationId !== null}
                  value={editDonation?.amount ?? ""}
                  onChange={(event) =>
                    setEditDonation((prev) => (prev ? { ...prev, amount: event.target.value } : prev))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="donorEmail"
                  disabled={editingDonationId !== null}
                  value={editDonation?.donorEmail ?? ""}
                  onChange={(event) =>
                    setEditDonation((prev) => (prev ? { ...prev, donorEmail: event.target.value } : prev))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="opsional"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Nomor HP</label>
                <input
                  name="donorPhone"
                  disabled={editingDonationId !== null}
                  value={editDonation?.donorPhone ?? ""}
                  onChange={(event) =>
                    setEditDonation((prev) => (prev ? { ...prev, donorPhone: event.target.value } : prev))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="opsional"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Kampanye</label>
                <Select
                  value={editDonation?.campaignId ?? "__general__"}
                  onValueChange={(value) =>
                    setEditDonation((prev) => (prev ? { ...prev, campaignId: value } : prev))
                  }
                  disabled={editingDonationId !== null}
                >
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
                  disabled={editingDonationId !== null}
                  value={editDonation?.message ?? ""}
                  onChange={(event) =>
                    setEditDonation((prev) => (prev ? { ...prev, message: event.target.value } : prev))
                  }
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Catatan transfer manual, sumber donasi, dll"
                />
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={editDonation?.isAnonymous ?? false}
                  disabled={editingDonationId !== null}
                  onChange={(event) =>
                    setEditDonation((prev) =>
                      prev
                        ? {
                            ...prev,
                            isAnonymous: event.target.checked,
                            donorName: event.target.checked ? "" : prev.donorName,
                          }
                        : prev
                    )
                  }
                  className="rounded border-input"
                />
                <span>Tampilkan sebagai Hamba Allah</span>
              </label>
              <div className="flex justify-end gap-3 md:col-span-2">
                <Button type="button" variant="outline" disabled={editingDonationId !== null} onClick={() => setEditDonation(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={editingDonationId !== null}>
                  {editingDonationId !== null ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
      ) : null}
    </div>
  );
}
