"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
import type { DashboardCampaignItem, DashboardCampaignLinkedArticle } from "@/components/dashboard-donation-management";
import { type PendingUploadImage, uploadFileToR2 } from "@/lib/upload-client";

type DashboardCampaignCreateFormProps = {
  variant?: "page" | "dialog";
  onCreated?: (campaign: DashboardCampaignItem) => void;
  onCancel?: () => void;
};

export function DashboardCampaignCreateForm({
  variant = "page",
  onCreated,
  onCancel,
}: DashboardCampaignCreateFormProps) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("10000000");
  const [endDate, setEndDate] = useState("");
  const [statusValue, setStatusValue] = useState("true");
  const [pendingCoverImage, setPendingCoverImage] = useState<PendingUploadImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pendingCoverImageRef = useRef<PendingUploadImage | null>(null);

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
    setErrorMessage("");
    setIsSubmitting(true);

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const numericTarget = Number(targetAmount);

    if (normalizedTitle.length < 3) {
      setErrorMessage("Judul minimal 3 karakter.");
      setIsSubmitting(false);
      return;
    }

    if (normalizedDescription.length < 10) {
      setErrorMessage("Deskripsi minimal 10 karakter.");
      setIsSubmitting(false);
      return;
    }

    if (!Number.isFinite(numericTarget) || numericTarget < 100000) {
      setErrorMessage("Target minimal Rp 100.000.");
      setIsSubmitting(false);
      return;
    }

    try {
      const resolvedCoverImage = pendingCoverImage
        ? await uploadFileToR2(pendingCoverImage.file, "campaigns/covers")
        : coverImage.trim() || undefined;

      const payload: {
        title: string;
        description: string;
        targetAmount: number;
        isActive: boolean;
        linkedArticleIds: string[];
        coverImage?: string;
        endDate?: string;
      } = {
        title: normalizedTitle,
        description: normalizedDescription,
        targetAmount: numericTarget,
        isActive: statusValue === "true",
        linkedArticleIds: [],
      };

      if (resolvedCoverImage) {
        payload.coverImage = resolvedCoverImage;
      }

      if (endDate) {
        payload.endDate = new Date(`${endDate}T23:59:59`).toISOString();
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

      if (pendingCoverImageRef.current?.previewUrl) {
        URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
      }

      setPendingCoverImage(null);
      toast.success("Kampanye berhasil dibuat.");

      const createdCampaign: DashboardCampaignItem = {
        id: created.id,
        title: created.title,
        slug: created.slug,
        description: created.description,
        coverImage: created.coverImage,
        targetAmount: created.targetAmount,
        collectedAmount: 0,
        progress: 0,
        donationCount: 0,
        isActive: created.isActive,
        endDate: created.endDate,
        createdAt: created.createdAt,
        linkedArticles: created.linkedArticles,
      };

      if (variant === "dialog") {
        onCreated?.(createdCampaign);
        return;
      }

      router.push("/kampanye");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal membuat kampanye.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {variant === "page" ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Buat Kampanye</h1>
            <p className="text-sm text-muted-foreground">
              Susun kampanye baru dengan cover, judul, deskripsi, dan pengaturan donasi.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/kampanye">Kembali ke Kampanye</Link>
          </Button>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
        <div className="space-y-6">
          <form id="campaign-create-form" className="space-y-6" onSubmit={handleSubmit}>
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
                      required
                      minLength={3}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      placeholder="Contoh: Renovasi Tempat Wudhu"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                    <textarea
                      required
                      minLength={10}
                      rows={8}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-sm"
                      placeholder="Jelaskan tujuan kampanye, urgensi, dan manfaatnya..."
                    />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pengaturan
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Target Donasi</label>
                <input
                  type="number"
                  required
                  min={100000}
                  value={targetAmount}
                  onChange={(event) => setTargetAmount(event.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  placeholder="10000000"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Tanggal Berakhir</label>
                <DatePickerField value={endDate} onChange={setEndDate} />
              </div>
              <div>
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

            <div className="mt-6 flex justify-end">
              <div className="flex gap-3">
                {variant === "dialog" ? (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Batal
                  </Button>
                ) : null}
                <Button type="submit" form="campaign-create-form" disabled={isSubmitting} className="min-w-48">
                  {isSubmitting ? "Menyimpan..." : "Simpan Kampanye"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
