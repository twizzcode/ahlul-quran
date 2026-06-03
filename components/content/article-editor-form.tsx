"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/blocks/editor-00/editor";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { R2ImageUploadField } from "@/components/shared/r2-image-upload-field";
import {
  replacePendingImageUrlsInHtml,
  uploadFileToR2,
  type PendingUploadImage,
} from "@/lib/storage/upload-client";
import {
  type PublicArticleType,
} from "@/lib/content/public-articles";
import { cn } from "@/lib/utils";

type CampaignOption = {
  id: string;
  title: string;
};

type InitialArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  type: PublicArticleType;
  donationCampaignId: string | null;
};

type ArticleEditorFormProps = {
  mode: "create" | "edit";
  campaigns: CampaignOption[];
  initialArticle?: InitialArticle;
  initialType?: PublicArticleType;
};

function getPlainTextFromHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getBlobImageSourcesFromHtml(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  return new Set(
    Array.from(document.querySelectorAll("img"))
      .map((image) => image.getAttribute("src")?.trim() || "")
      .filter((src) => src.startsWith("blob:")),
  );
}

export function ArticleEditorForm({
  mode,
  campaigns,
  initialArticle,
  initialType = "artikel",
}: ArticleEditorFormProps) {
  const router = useRouter();
  const { user } = useDashboard();
  const articleType = initialArticle?.type ?? initialType;
  const contentLabel = articleType === "berita" ? "Berita" : "Artikel";

  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || "");
  const [content, setContent] = useState(initialArticle?.content || "");
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialArticle?.donationCampaignId || ""
  );
  const [campaignQuery, setCampaignQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingCoverImage, setPendingCoverImage] = useState<PendingUploadImage | null>(null);
  const [pendingContentImages, setPendingContentImages] = useState<PendingUploadImage[]>([]);
  const pendingCoverImageRef = useRef<PendingUploadImage | null>(null);
  const pendingContentImagesRef = useRef<PendingUploadImage[]>([]);

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return mode === "create" ? `Menyimpan ${contentLabel.toLowerCase()}...` : `Menyimpan perubahan ${contentLabel.toLowerCase()}...`;
    }

    return mode === "create" ? `Simpan ${contentLabel}` : `Simpan Perubahan ${contentLabel}`;
  }, [contentLabel, isSubmitting, mode]);
  const filteredCampaigns = useMemo(() => {
    const normalized = campaignQuery.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return campaigns.filter(
      (campaign) =>
        campaign.id !== selectedCampaignId &&
        campaign.title.toLowerCase().includes(normalized)
    );
  }, [campaignQuery, campaigns, selectedCampaignId]);

  useEffect(() => {
    pendingCoverImageRef.current = pendingCoverImage;
  }, [pendingCoverImage]);

  useEffect(() => {
    pendingContentImagesRef.current = pendingContentImages;
  }, [pendingContentImages]);

  useEffect(() => {
    setPendingContentImages((current) => {
      if (current.length === 0) {
        return current;
      }

      const usedSources = getBlobImageSourcesFromHtml(content);
      const next = current.filter((item) => usedSources.has(item.previewUrl));

      if (next.length === current.length) {
        return current;
      }

      current
        .filter((item) => !usedSources.has(item.previewUrl))
        .forEach((item) => URL.revokeObjectURL(item.previewUrl));

      return next;
    });
  }, [content]);

  useEffect(() => {
    return () => {
      if (pendingCoverImageRef.current) {
        URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
      }
      pendingContentImagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  function handlePendingCoverImageAdd(file: File | null, previewUrl: string) {
    if (pendingCoverImageRef.current?.previewUrl) {
      URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
    }

    setPendingCoverImage(file ? { file, previewUrl } : null);
  }

  function handleCoverImageChange(value: string) {
    if (!value && pendingCoverImageRef.current?.previewUrl) {
      URL.revokeObjectURL(pendingCoverImageRef.current.previewUrl);
      setPendingCoverImage(null);
    }

    setCoverImage(value);
  }

  async function submitArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (title.trim().length < 3) {
      setErrorMessage("Judul minimal 3 karakter.");
      return;
    }

    const plainContent = getPlainTextFromHtml(content);
    if (plainContent.length < 10) {
      setErrorMessage("Konten minimal 10 karakter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const resolvedCoverImage = pendingCoverImage
        ? await uploadFileToR2(pendingCoverImage.file, "articles/covers")
        : coverImage.trim() || undefined;
      const resolvedContent = await replacePendingImageUrlsInHtml(
        content,
        pendingContentImages,
        "articles/content",
      );

      const payload: Record<string, unknown> = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: resolvedContent,
        type: articleType,
        donationCampaignId:
          articleType === "berita" && selectedCampaignId ? selectedCampaignId : undefined,
      };

      if (resolvedCoverImage) {
        payload.coverImage = resolvedCoverImage;
      } else if (mode === "edit") {
        payload.coverImage = null;
      }

      if (articleType !== "berita" && mode === "edit") {
        payload.donationCampaignId = null;
      } else if (articleType === "berita" && !selectedCampaignId && mode === "edit") {
        payload.donationCampaignId = null;
      }

      if (mode === "create") {
        payload.authorId = user.id;
      }

      const endpoint =
        mode === "create"
          ? "/api/articles"
          : `/api/articles/${initialArticle?.slug}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menyimpan artikel.");
      }

      if (pendingCoverImage) {
        URL.revokeObjectURL(pendingCoverImage.previewUrl);
        setPendingCoverImage(null);
      }

      setCoverImage(resolvedCoverImage ?? "");
      setContent(resolvedContent);
      pendingContentImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingContentImages([]);

      toast.success(
        mode === "create"
          ? `${contentLabel} berhasil dibuat.`
          : `${contentLabel} berhasil diperbarui.`
      );
      router.push("/artikel");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create"
              ? `Tulis ${contentLabel} Baru`
              : `Edit ${contentLabel}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi judul dan isi konten.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/artikel">{`Kembali ke Daftar ${contentLabel}`}</Link>
          </Button>
          <Button type="submit" form="article-editor-form" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </div>

      <form id="article-editor-form" className="space-y-6" onSubmit={submitArticle}>
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 space-y-1">
                <h2 className="text-base font-semibold">Cover Image</h2>
                <p className="text-xs text-muted-foreground">
                  Upload cover utama artikel agar tampil lebih kuat di list dan halaman detail.
                </p>
              </div>
              <R2ImageUploadField
                label=""
                value={coverImage}
                folder="articles/covers"
                onChange={handleCoverImageChange}
                deferUpload
                onPendingFileChange={handlePendingCoverImageAdd}
                onError={setErrorMessage}
              />
            </section>

            <div className="rounded-2xl border bg-card shadow-sm">
              <div className="border-b px-5 py-4">
                <h2 className="text-base font-semibold">{`Detail ${contentLabel}`}</h2>
                <p className="text-xs text-muted-foreground">
                  Informasi utama dan ringkasan konten.
                </p>
              </div>

              <div className="space-y-6 p-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Informasi Dasar
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">{`Judul ${contentLabel}`}</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Contoh: Keutamaan Sedekah di Hari Jumat"
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                      required
                    />
                  </div>

                </div>

                <div className="space-y-4 border-t pt-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Ringkasan / Excerpt (opsional)</label>
                    <textarea
                      rows={5}
                      value={excerpt}
                      onChange={(event) => setExcerpt(event.target.value)}
                      placeholder="Ringkasan singkat artikel..."
                      className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {articleType === "berita" ? (
              <section className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-4 space-y-1">
                  <h2 className="text-base font-semibold">Campaign Terkait</h2>
                  <p className="text-xs text-muted-foreground">
                    Hubungkan berita ke campaign donasi lewat pencarian judul campaign.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={campaignQuery}
                      onChange={(event) => setCampaignQuery(event.target.value)}
                      placeholder="Cari campaign..."
                      className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm"
                    />
                  </div>

                  {selectedCampaignId ? (
                    <div className="rounded-2xl border border-border/70 bg-white p-2">
                      {campaigns
                        .filter((campaign) => campaign.id === selectedCampaignId)
                        .map((campaign) => (
                          <button
                            key={campaign.id}
                            type="button"
                            onClick={() => setSelectedCampaignId("")}
                            className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors border-transparent bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/40"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-emerald-600 bg-emerald-600 text-white"
                            >
                              <Check className="h-3 w-3" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{campaign.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Klik lagi untuk membatalkan
                              </p>
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : null}

                  {campaignQuery.trim() ? (
                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-border/70 bg-white p-2">
                      {filteredCampaigns.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        Campaign tidak ditemukan.
                      </div>
                    ) : (
                      filteredCampaigns.map((campaign) => {
                        const isSelected = selectedCampaignId === campaign.id;

                        return (
                          <button
                            key={campaign.id}
                            type="button"
                            onClick={() =>
                              setSelectedCampaignId((current) =>
                                current === campaign.id ? "" : campaign.id
                              )
                            }
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm"
                                : "border-transparent bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/40"
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                                isSelected
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 bg-white text-transparent"
                              )}
                            >
                              <Check className="h-3 w-3" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{campaign.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Klik untuk {isSelected ? "melepas pilihan" : "memilih campaign ini"}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </section>

          <section>
            <Editor
              html={content}
              onHtmlChange={setContent}
              placeholder="Tulis isi artikel atau berita di sini..."
              allowImageUpload={false}
            />
          </section>
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </form>
    </div>
  );
}
