"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { R2ImageUploadField } from "@/components/r2-image-upload-field";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type DashboardCampaignItem,
  type DashboardDonationItem,
} from "@/components/dashboard-donation-management";
import { type PendingUploadImage, uploadFileToR2 } from "@/lib/upload-client";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type DashboardCampaignDetailProps = {
  campaign: DashboardCampaignItem;
  donations: DashboardDonationItem[];
};

function getStatusClass(status: DashboardDonationItem["status"]) {
  if (status === "SUCCESS") return "bg-green-100 text-green-700";
  if (status === "FAILED") return "bg-red-100 text-red-700";
  if (status === "EXPIRED") return "bg-amber-100 text-amber-700";
  if (status === "CHALLENGE") return "bg-orange-100 text-orange-700";
  if (status === "CANCELED") return "bg-slate-200 text-slate-700";
  return "bg-yellow-100 text-yellow-700";
}

function toDateInputValue(dateIso: string | null) {
  if (!dateIso) return "";
  return dateIso.slice(0, 10);
}

export function DashboardCampaignDetail({
  campaign,
  donations,
}: DashboardCampaignDetailProps) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState(campaign.coverImage ?? "");
  const [endDate, setEndDate] = useState(toDateInputValue(campaign.endDate));
  const [statusValue, setStatusValue] = useState(campaign.isActive ? "true" : "false");
  const [pendingCoverImage, setPendingCoverImage] = useState<PendingUploadImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pendingCoverImageRef = useRef<PendingUploadImage | null>(null);

  useEffect(() => {
    setCoverImage(campaign.coverImage ?? "");
    setEndDate(toDateInputValue(campaign.endDate));
    setStatusValue(campaign.isActive ? "true" : "false");
  }, [campaign.coverImage, campaign.endDate, campaign.isActive]);

  useEffect(() => {
    pendingCoverImageRef.current = pendingCoverImage;
  }, [pendingCoverImage]);

  useEffect(() => {
    return () => {
      if (pendingCoverImageRef.current?.previewUrl) {
        URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
      }
    };
  }, []);

  function handleCoverImageChange(value: string) {
    if (!value && pendingCoverImageRef.current?.previewUrl) {
      URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
      setPendingCoverImage(null);
    }

    setCoverImage(value);
  }

  function handlePendingCoverImageChange(file: File | null, previewUrl: string) {
    if (pendingCoverImageRef.current?.previewUrl) {
      URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
    }

    setPendingCoverImage(file ? { file, previewUrl } : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const targetAmount = Number(formData.get("targetAmount"));
    if (title.length < 3) {
      setErrorMessage("Judul minimal 3 karakter.");
      setIsSubmitting(false);
      return;
    }

    if (description.length < 10) {
      setErrorMessage("Deskripsi minimal 10 karakter.");
      setIsSubmitting(false);
      return;
    }

    if (!Number.isFinite(targetAmount) || targetAmount < 100000) {
      setErrorMessage("Target minimal Rp 100.000.");
      setIsSubmitting(false);
      return;
    }

    try {
      const resolvedCoverImage = pendingCoverImage
        ? await uploadFileToR2(pendingCoverImage.file, "campaigns/covers")
        : coverImage.trim() || undefined;

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          coverImage: resolvedCoverImage ?? null,
          targetAmount,
          isActive: statusValue === "true",
          endDate: endDate ? new Date(`${endDate}T23:59:59`).toISOString() : null,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal memperbarui kampanye.");
      }

      if (pendingCoverImageRef.current?.previewUrl) {
        URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
      }
      setPendingCoverImage(null);
      toast.success("Kampanye berhasil diperbarui.");
      router.push("/kampanye");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui kampanye.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Hapus kampanye "${campaign.title}"?\nDonasi yang sudah terhubung akan dilepas dari kampanye ini.`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menghapus kampanye.");
      }

      router.push("/kampanye");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus kampanye.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kelola Kampanye</h1>
          <p className="text-sm text-muted-foreground">
            Edit detail kampanye, cover image, status, dan berita yang tertaut.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/kampanye">Kembali ke Kampanye</Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <div className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="rounded-[24px] border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Informasi Utama
              </h3>
              <div className="mt-4 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                  <R2ImageUploadField
                    label="Cover Image"
                    value={coverImage}
                    folder="campaigns/covers"
                    deferUpload
                    onChange={handleCoverImageChange}
                    onPendingFileChange={handlePendingCoverImageChange}
                    description="Upload cover kampanye dengan drag & drop atau pilih file."
                    onError={setErrorMessage}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Judul</label>
                    <input
                      name="title"
                      required
                      minLength={3}
                      defaultValue={campaign.title}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                    <textarea
                      name="description"
                      required
                      minLength={10}
                      rows={8}
                      defaultValue={campaign.description}
                      className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Pengaturan
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Target</label>
                  <input
                    type="number"
                    name="targetAmount"
                    required
                    min={100000}
                    defaultValue={Math.round(campaign.targetAmount)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tanggal Berakhir</label>
                  <DatePickerField value={endDate} onChange={setEndDate} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <Select value={statusValue} onValueChange={setStatusValue}>
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
            <div className="flex flex-wrap justify-between gap-3">
              <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? "Menghapus..." : "Hapus Kampanye"}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-48">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border bg-card p-5">
            <h2 className="font-semibold">Ringkasan Kampanye</h2>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(campaign.collectedAmount)}
                </span>
                <span className="text-slate-500">
                  dari {formatCurrency(campaign.targetAmount)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">{campaign.progress}% terkumpul</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border bg-emerald-50/70 p-4">
                <p className="text-xs text-muted-foreground">Terkumpul</p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">
                  {formatCurrency(campaign.collectedAmount)}
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(campaign.targetAmount)}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-muted-foreground">Donasi Sukses</p>
                <p className="mt-1 text-lg font-semibold">{campaign.donationCount}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="mt-1 text-lg font-semibold">{campaign.isActive ? "Aktif" : "Nonaktif"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Berita Tertaut</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {campaign.linkedArticles.length}
              </span>
            </div>
            {campaign.linkedArticles.length === 0 ? (
              <div className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground">
                Belum ada berita yang tertaut ke kampanye ini.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {campaign.linkedArticles.map((article) => (
                  <div key={article.id} className="rounded-xl border p-3">
                    <p className="line-clamp-2 text-sm font-medium">{article.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(article.publishedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border bg-card p-5">
            <h2 className="font-semibold">Donasi Terkait</h2>
            {donations.length === 0 ? (
              <div className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground">
                Belum ada donasi yang terkait dengan kampanye ini.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{donation.donorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {donation.orderId} • {formatDateTime(donation.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(donation.amount)}</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClass(
                          donation.status
                        )}`}
                      >
                        {donation.status}
                      </span>
                    </div>
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
