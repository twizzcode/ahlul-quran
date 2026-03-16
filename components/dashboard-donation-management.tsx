"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { R2ImageUploadField } from "@/components/r2-image-upload-field";
import { DatePickerField } from "@/components/ui/date-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PendingUploadImage, uploadFileToR2 } from "@/lib/upload-client";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export type DashboardCampaignLinkedArticle = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
};

export type DashboardCampaignArticleOption = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  categoryName: string | null;
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
  type: string;
  amount: number;
  paymentType: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CHALLENGE" | "CANCELED";
  createdAt: string;
  campaignId: string | null;
  campaignTitle: string | null;
};

type DashboardDonationManagementProps = {
  mode: "donations" | "campaigns";
  initialArticleOptions: DashboardCampaignArticleOption[];
  initialCampaigns: DashboardCampaignItem[];
  initialDonations: DashboardDonationItem[];
};

const donationTypeLabel: Record<string, string> = {
  INFAQ: "Infaq",
  SEDEKAH: "Sedekah",
  ZAKAT: "Zakat",
  WAKAF: "Wakaf",
  PEMBANGUNAN: "Pembangunan",
  OPERASIONAL: "Operasional",
  OTHER: "Lainnya",
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
  initialArticleOptions,
  initialCampaigns,
  initialDonations,
}: DashboardDonationManagementProps) {
  const [articleOptions] = useState(initialArticleOptions);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [donations, setDonations] = useState(initialDonations);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingManualDonation, setIsCreatingManualDonation] = useState(false);
  const [approvingDonationId, setApprovingDonationId] = useState<string | null>(null);
  const [cancelingDonationId, setCancelingDonationId] = useState<string | null>(null);
  const [createCoverImage, setCreateCoverImage] = useState("");
  const [pendingCreateCoverImage, setPendingCreateCoverImage] =
    useState<PendingUploadImage | null>(null);
  const [createEndDate, setCreateEndDate] = useState("");
  const [createStatusValue, setCreateStatusValue] = useState("true");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const pendingCreateCoverImageRef = useRef<PendingUploadImage | null>(null);
  const isDonationMode = mode === "donations";
  const isCampaignMode = mode === "campaigns";

  useEffect(() => {
    pendingCreateCoverImageRef.current = pendingCreateCoverImage;
  }, [pendingCreateCoverImage]);

  useEffect(() => {
    return () => {
      if (pendingCreateCoverImageRef.current?.previewUrl) {
        URL.revokeObjectURL(pendingCreateCoverImageRef.current.previewUrl);
      }
    };
  }, []);

  function handleCreateCoverImageChange(value: string) {
    if (!value && pendingCreateCoverImageRef.current?.previewUrl) {
      URL.revokeObjectURL(pendingCreateCoverImageRef.current.previewUrl);
      setPendingCreateCoverImage(null);
    }

    setCreateCoverImage(value);
  }

  function handlePendingCreateCoverImageChange(file: File | null, previewUrl: string) {
    if (pendingCreateCoverImageRef.current?.previewUrl) {
      URL.revokeObjectURL(pendingCreateCoverImageRef.current.previewUrl);
    }

    setPendingCreateCoverImage(file ? { file, previewUrl } : null);
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
      if (statusFilter && donation.status !== statusFilter) {
        return false;
      }

      if (typeFilter && donation.type !== typeFilter) {
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
  }, [donations, statusFilter, typeFilter, search]);

  async function handleCreateCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setActionError("");
    setActionSuccess("");
    setIsCreating(true);

    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const targetAmount = Number(formData.get("targetAmount"));
    const linkedArticleIds = formData
      .getAll("linkedArticleIds")
      .map((value) => String(value))
      .filter(Boolean);

    if (title.length < 3) {
      setActionError("Judul minimal 3 karakter.");
      setIsCreating(false);
      return;
    }

    if (description.length < 10) {
      setActionError("Deskripsi minimal 10 karakter.");
      setIsCreating(false);
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount < 100000) {
      setActionError("Target minimal Rp 100.000.");
      setIsCreating(false);
      return;
    }

    try {
      const payload: {
        title: string;
        description: string;
        coverImage?: string;
        targetAmount: number;
        isActive: boolean;
        endDate?: string;
        linkedArticleIds: string[];
      } = {
        title,
        description,
        targetAmount,
        isActive: createStatusValue === "true",
        linkedArticleIds,
      };

      const resolvedCoverImage = pendingCreateCoverImage
        ? await uploadFileToR2(pendingCreateCoverImage.file, "campaigns/covers")
        : createCoverImage.trim() || undefined;

      if (resolvedCoverImage) {
        payload.coverImage = resolvedCoverImage;
      }

      if (createEndDate) {
        payload.endDate = new Date(`${createEndDate}T23:59:59`).toISOString();
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal membuat kampanye.");
      }

      const created = result.data as {
        id: string;
        title: string;
        slug: string;
        description: string;
        coverImage: string | null;
        targetAmount: number;
        isActive: boolean;
        endDate: string | null;
        createdAt: string;
        linkedArticles: DashboardCampaignLinkedArticle[];
      };

      setCampaigns((prev) => [
        {
          id: created.id,
          title: created.title,
          slug: created.slug,
          description: created.description,
          coverImage: created.coverImage ?? null,
          targetAmount: created.targetAmount,
          collectedAmount: 0,
          progress: 0,
          donationCount: 0,
          isActive: created.isActive,
          endDate: created.endDate,
          createdAt: created.createdAt,
          linkedArticles: created.linkedArticles,
        },
        ...prev,
      ]);

      form.reset();
      if (pendingCreateCoverImageRef.current?.previewUrl) {
        URL.revokeObjectURL(pendingCreateCoverImageRef.current.previewUrl);
      }
      setPendingCreateCoverImage(null);
      setCreateCoverImage("");
      setCreateEndDate("");
      setCreateStatusValue("true");
      setActionSuccess("Kampanye berhasil dibuat.");
      setIsCreateFormOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal membuat kampanye.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleApproveDonation(donation: DashboardDonationItem) {
    const confirmed = window.confirm(
      `Approve donasi ${donation.orderId} sebesar ${formatCurrency(donation.amount)}?`
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setActionSuccess("");
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

      setActionSuccess("Donasi transfer BSI berhasil di-approve.");
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
    setActionSuccess("");
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

      setActionSuccess("Donasi berhasil dibatalkan.");
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
    setActionSuccess("");
    setIsCreatingManualDonation(true);

    const formData = new FormData(form);
    const donorName = String(formData.get("donorName") || "").trim();
    const donorEmail = String(formData.get("donorEmail") || "").trim();
    const donorPhone = String(formData.get("donorPhone") || "").trim();
    const amount = Number(formData.get("amount"));
    const type = String(formData.get("type") || "PEMBANGUNAN");
    const campaignId = String(formData.get("campaignId") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const isAnonymous = formData.get("isAnonymous") === "on";

    if (donorName.length < 2) {
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
          donorName,
          donorEmail: donorEmail || undefined,
          donorPhone: donorPhone || undefined,
          amount,
          type,
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
        type: string;
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
          type: created.type,
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
      setActionSuccess("Donasi manual berhasil ditambahkan.");
      setIsManualFormOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menambahkan donasi manual.");
    } finally {
      setIsCreatingManualDonation(false);
    }
  }

  function renderLinkedArticleField(selectedIds: string[]) {
    return (
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium">Update Berita Tertaut</label>
        {articleOptions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Belum ada berita terbit yang bisa ditautkan ke timeline kampanye.
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
            {articleOptions.map((article) => {
              const isChecked = selectedIds.includes(article.id);

              return (
                <label
                  key={article.id}
                  className={`flex cursor-pointer gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isChecked ? "bg-emerald-50" : "hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="linkedArticleIds"
                    value={article.id}
                    defaultChecked={isChecked}
                    className="mt-1 h-4 w-4 rounded border-input text-primary"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(article.publishedAt)}
                      {article.categoryName ? ` • ${article.categoryName}` : ""}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Berita yang dipilih akan tampil sebagai timeline update pada halaman detail
          donasi.
        </p>
      </div>
    );
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
            <Button variant="outline" onClick={() => setIsManualFormOpen((value) => !value)}>
              {isManualFormOpen ? "Tutup Donasi Manual" : "+ Donasi Manual"}
            </Button>
          ) : null}
          {isCampaignMode ? (
            <Button onClick={() => setIsCreateFormOpen((value) => !value)}>
              {isCreateFormOpen ? "Tutup Form" : "+ Buat Kampanye"}
            </Button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}
      {actionSuccess ? (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      ) : null}

      {isCampaignMode && isCreateFormOpen ? (
        <section className="mb-8 rounded-[24px] border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Tambah Kampanye Donasi</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Susun kampanye baru dengan cover, target, dan berita update yang relevan.
            </p>
          </div>

          <form className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]" onSubmit={handleCreateCampaign}>
            <div className="space-y-6">
              <section className="rounded-2xl border bg-background p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Visual
                </h3>
                <div className="mt-4">
                  <R2ImageUploadField
                    label="Cover Image"
                    value={createCoverImage}
                    folder="campaigns/covers"
                    deferUpload
                    onChange={handleCreateCoverImageChange}
                    onPendingFileChange={handlePendingCreateCoverImageChange}
                    description="Upload cover kampanye dengan drag & drop atau pilih file."
                    onError={setActionError}
                  />
                </div>
              </section>

              <section className="rounded-2xl border bg-background p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Informasi Utama
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Judul</label>
                    <input
                      name="title"
                      required
                      minLength={3}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      placeholder="Contoh: Renovasi Tempat Wudhu"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                    <textarea
                      name="description"
                      required
                      minLength={10}
                      rows={5}
                      className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
                      placeholder="Jelaskan tujuan kampanye, urgensi, dan manfaatnya..."
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border bg-background p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pengaturan
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Target Donasi</label>
                    <input
                      type="number"
                      name="targetAmount"
                      required
                      min={100000}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      placeholder="10000000"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Tanggal Berakhir (opsional)
                    </label>
                    <DatePickerField value={createEndDate} onChange={setCreateEndDate} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Status</label>
                    <Select value={createStatusValue} onValueChange={setCreateStatusValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Aktif</SelectItem>
                        <SelectItem value="false">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border bg-background p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Update Berita
                </h3>
                <div className="mt-4">{renderLinkedArticleField([])}</div>
              </section>

              <div className="flex justify-end">
                <Button type="submit" disabled={isCreating} className="min-w-48">
                  {isCreating ? "Menyimpan..." : "Simpan Kampanye"}
                </Button>
              </div>
            </div>
          </form>
        </section>
      ) : null}

      {isDonationMode && isManualFormOpen ? (
        <section className="mb-8 rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Tambah Donasi Manual</h2>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateManualDonation}>
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Donatur</label>
              <input
                name="donorName"
                required
                minLength={2}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Nama donatur"
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
              <label className="mb-2 block text-sm font-medium">Jenis Donasi</label>
              <select
                name="type"
                defaultValue="PEMBANGUNAN"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(donationTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Kampanye</label>
              <select
                name="campaignId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Donasi Umum</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
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
              <input type="checkbox" name="isAnonymous" className="rounded border-input" />
              <span>Tampilkan sebagai Hamba Allah</span>
            </label>
            <div className="flex items-end md:col-span-2">
              <Button type="submit" disabled={isCreatingManualDonation} className="w-full md:w-auto">
                {isCreatingManualDonation ? "Menyimpan..." : "Simpan Donasi Manual"}
              </Button>
            </div>
          </form>
        </section>
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

      {isCampaignMode && !isCreateFormOpen ? (
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
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="SUCCESS">Berhasil</option>
            <option value="PENDING">Menunggu</option>
            <option value="FAILED">Gagal</option>
            <option value="EXPIRED">Kadaluarsa</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="CANCELED">Canceled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Semua Jenis</option>
            {Object.entries(donationTypeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
                <th className="p-4 text-left font-medium">Jenis</th>
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
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    Tidak ada data donasi untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="border-b last:border-b-0">
                    <td className="p-4 font-mono text-xs">{donation.orderId}</td>
                    <td className="p-4">{donation.donorName}</td>
                    <td className="p-4">{donation.campaignTitle || "-"}</td>
                    <td className="p-4">{donationTypeLabel[donation.type] || donation.type}</td>
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
