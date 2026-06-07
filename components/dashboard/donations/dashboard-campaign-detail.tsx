"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
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
import { R2ImageUploadField } from "@/components/shared/r2-image-upload-field";
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
  type DashboardCampaignGalleryOption,
  type DashboardCampaignItem,
  type DashboardDonationItem,
} from "@/components/dashboard/donations/dashboard-donation-management";
import { type PendingUploadImage, uploadFileToR2 } from "@/lib/storage/upload-client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CalendarDays, ImageIcon, Newspaper, Target, Users } from "lucide-react";

type DashboardCampaignDetailProps = {
  campaign: DashboardCampaignItem;
  donations: DashboardDonationItem[];
  galleryOptions: DashboardCampaignGalleryOption[];
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
  galleryOptions,
}: DashboardCampaignDetailProps) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState(campaign.coverImage ?? "");
  const [endDate, setEndDate] = useState(toDateInputValue(campaign.endDate));
  const [statusValue, setStatusValue] = useState(campaign.isActive ? "true" : "false");
  const [linkedGalleryIds, setLinkedGalleryIds] = useState(
    campaign.linkedGalleries.map((item) => item.id)
  );
  const [pendingCoverImage, setPendingCoverImage] = useState<PendingUploadImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pendingCoverImageRef = useRef<PendingUploadImage | null>(null);

  useEffect(() => {
    setCoverImage(campaign.coverImage ?? "");
    setEndDate(toDateInputValue(campaign.endDate));
    setStatusValue(campaign.isActive ? "true" : "false");
    setLinkedGalleryIds(campaign.linkedGalleries.map((item) => item.id));
  }, [campaign.coverImage, campaign.endDate, campaign.isActive, campaign.linkedGalleries]);

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
          linkedGalleryIds,
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

      setIsDeleteDialogOpen(false);
      router.push("/kampanye");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus kampanye.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#f8fff9_0%,#ffffff_55%,#eef8f1_100%)]">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.3fr)_280px] lg:px-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      campaign.isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {campaign.isActive ? "Kampanye Aktif" : "Kampanye Nonaktif"}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    {campaign.progress}% tercapai
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    {campaign.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Kelola detail kampanye, target penggalangan, media pendukung, dan daftar
                    donasi yang sudah masuk dari satu halaman.
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="rounded-xl bg-white">
                <Link href="/kampanye">Kembali ke Kampanye</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Terkumpul</p>
                <p className="mt-2 text-xl font-semibold text-emerald-700">
                  {formatCurrency(campaign.collectedAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {formatCurrency(campaign.targetAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Donasi Sukses</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{campaign.donationCount}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Berakhir</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {campaign.endDate ? formatDateTime(campaign.endDate) : "Tanpa batas waktu"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-sm">
            <div className="relative aspect-[5/4] bg-muted">
              {campaign.coverImage ? (
                <Image
                  src={campaign.coverImage}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Cover kampanye belum tersedia
                </div>
              )}
            </div>
            <div className="border-t border-emerald-100 px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">Progress penggalangan</span>
                <span className="font-semibold text-slate-900">{campaign.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <div className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950">Informasi Utama</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Perbarui identitas kampanye dan materi visual yang tampil di halaman publik.
                </p>
              </div>
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

            <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950">Pengaturan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Atur target dana, status kampanye, dan batas waktu penggalangan.
                </p>
              </div>
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

            <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Galeri Tertaut</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pilih galeri yang ingin ditampilkan sebagai pendukung kampanye ini.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {linkedGalleryIds.length} dipilih
                </span>
              </div>
              <div className="mt-4">
                {galleryOptions.length === 0 ? (
                  <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    Belum ada galeri yang tersedia untuk ditautkan.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {galleryOptions.map((gallery) => {
                      const isSelected = linkedGalleryIds.includes(gallery.id);

                      return (
                        <label
                          key={gallery.id}
                          className={
                            isSelected
                              ? "flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-700 bg-emerald-50 p-3"
                              : "flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-100 p-3 hover:border-emerald-300"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              setLinkedGalleryIds((current) =>
                                event.target.checked
                                  ? [...current, gallery.id]
                                  : current.filter((id) => id !== gallery.id)
                              );
                            }}
                            className="mt-1 rounded border-input"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                              {gallery.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {gallery.imageCount} foto
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
            <div className="flex flex-wrap justify-between gap-3 rounded-[26px] border border-slate-200 bg-card p-5 shadow-sm">
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                {isDeleting ? "Menghapus..." : "Hapus Kampanye"}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-48">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">Ringkasan Kampanye</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {campaign.progress}% progress
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/80">Total Terkumpul</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">
                  {formatCurrency(campaign.collectedAmount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  dari target {formatCurrency(campaign.targetAmount)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target Dana</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(campaign.targetAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Donasi Sukses</p>
                    <p className="font-semibold text-slate-900">{campaign.donationCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Batas Waktu</p>
                    <p className="font-semibold text-slate-900">
                      {campaign.endDate ? formatDateTime(campaign.endDate) : "Tanpa batas waktu"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Galeri Aktif</p>
                    <p className="font-semibold text-slate-900">
                      {campaign.linkedGalleries.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">Galeri Tertaut</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {campaign.linkedGalleries.length}
              </span>
            </div>
            {campaign.linkedGalleries.length === 0 ? (
              <div className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground">
                Belum ada galeri yang tertaut ke kampanye ini.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {campaign.linkedGalleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"
                  >
                    {gallery.coverImage ? (
                      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={gallery.coverImage} alt={gallery.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                        No Cover
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium">{gallery.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {gallery.imageCount} foto • {formatDateTime(gallery.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">Berita Tertaut</h2>
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
                  <div key={article.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                        <Newspaper className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium">{article.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(article.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">Donasi Terkait</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {donations.length}
              </span>
            </div>
            {donations.length === 0 ? (
              <div className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground">
                Belum ada donasi yang terkait dengan kampanye ini.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 text-sm"
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kampanye?</AlertDialogTitle>
            <AlertDialogDescription>
              Kampanye <span className="font-medium text-slate-900">{campaign.title}</span> akan
              dihapus. Donasi yang sudah terhubung akan dilepas dari kampanye ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Menghapus..." : "Hapus Kampanye"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
