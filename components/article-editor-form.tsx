"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Editor } from "@/components/blocks/editor-00/editor";
import { useDashboard } from "@/components/dashboard-provider";
import { R2ImageUploadField } from "@/components/r2-image-upload-field";
import {
  replacePendingImageUrlsInHtml,
  uploadFileToR2,
  type PendingUploadImage,
} from "@/lib/upload-client";
import {
  getExplicitArticleType,
  getVisibleArticleTags,
  type PublicArticleType,
  withArticleTypeTag,
} from "@/lib/public-articles";

type CategoryOption = {
  id: string;
  name: string;
};

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
  categoryId: string | null;
  donationCampaignId: string | null;
  tags: string[];
};

type ArticleEditorFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  campaigns: CampaignOption[];
  initialArticle?: InitialArticle;
  initialType?: PublicArticleType;
};

const EMPTY_SELECT_VALUE = "__none__";

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
  categories,
  campaigns,
  initialArticle,
  initialType = "artikel",
}: ArticleEditorFormProps) {
  const router = useRouter();
  const { user } = useDashboard();
  const articleType =
    initialArticle ? getExplicitArticleType(initialArticle.tags) || "artikel" : initialType;

  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || "");
  const [tagsInput, setTagsInput] = useState(
    initialArticle ? getVisibleArticleTags(initialArticle.tags).join(", ") : ""
  );
  const [content, setContent] = useState(initialArticle?.content || "");
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">(
    initialArticle?.categoryId ? "existing" : categories.length > 0 ? "existing" : "new"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialArticle?.categoryId || ""
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialArticle?.donationCampaignId || ""
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingCoverImage, setPendingCoverImage] = useState<PendingUploadImage | null>(null);
  const [pendingContentImages, setPendingContentImages] = useState<PendingUploadImage[]>([]);
  const pendingCoverImageRef = useRef<PendingUploadImage | null>(null);
  const pendingContentImagesRef = useRef<PendingUploadImage[]>([]);

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return mode === "create" ? "Menyimpan artikel..." : "Menyimpan perubahan...";
    }

    return mode === "create" ? "Simpan Artikel" : "Simpan Perubahan";
  }, [isSubmitting, mode]);

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

  function handlePendingContentImageAdd(file: File, previewUrl: string) {
    setPendingContentImages((current) => {
      if (current.some((item) => item.previewUrl === previewUrl)) {
        return current;
      }

      return [...current, { file, previewUrl }];
    });
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

    if (categoryMode === "new" && newCategoryName.trim() !== "" && newCategoryName.trim().length < 3) {
      setErrorMessage("Sub tema baru minimal 3 karakter.");
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
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const finalTags = withArticleTypeTag(tags, articleType);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: resolvedContent,
        tags: finalTags,
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

      if (categoryMode === "existing") {
        if (selectedCategoryId) {
          payload.categoryId = selectedCategoryId;
        } else if (mode === "edit") {
          payload.categoryId = null;
        }
      } else {
        if (newCategoryName.trim()) {
          payload.categoryName = newCategoryName.trim();
        } else if (mode === "edit") {
          payload.categoryId = null;
        }
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
          ? `${articleType === "berita" ? "Berita" : "Artikel"} berhasil dibuat.`
          : `${articleType === "berita" ? "Berita" : "Artikel"} berhasil diperbarui.`
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create"
              ? `Tulis ${articleType === "berita" ? "Berita" : "Artikel"} Baru`
              : `Edit ${articleType === "berita" ? "Berita" : "Artikel"}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi judul, sub tema, dan isi konten.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/artikel">Kembali ke Daftar Artikel</Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={submitArticle}>
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
                <h2 className="text-base font-semibold">Detail Artikel</h2>
                <p className="text-xs text-muted-foreground">
                  Informasi utama, metadata, dan pengelompokan konten.
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
                    <label className="mb-2 block text-sm font-medium">Judul Artikel</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Contoh: Keutamaan Sedekah di Hari Jumat"
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Tags (pisahkan koma)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(event) => setTagsInput(event.target.value)}
                      placeholder="Fiqh, Sedekah, Kajian"
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Organisasi Konten
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Tipe / Sub Tema</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={categoryMode === "existing" ? "default" : "outline"}
                        onClick={() => setCategoryMode("existing")}
                      >
                        Pilih yang ada
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={categoryMode === "new" ? "default" : "outline"}
                        onClick={() => setCategoryMode("new")}
                      >
                        Buat sub tema baru
                      </Button>
                    </div>
                  </div>

                  <div>
                    {categoryMode === "existing" ? (
                      <>
                        <label className="mb-2 block text-sm font-medium">Kategori</label>
                        <Select
                          value={selectedCategoryId || EMPTY_SELECT_VALUE}
                          onValueChange={(value) =>
                            setSelectedCategoryId(
                              value === EMPTY_SELECT_VALUE ? "" : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tanpa kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EMPTY_SELECT_VALUE}>
                              Tanpa kategori
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <label className="mb-2 block text-sm font-medium">Nama Sub Tema Baru</label>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(event) => setNewCategoryName(event.target.value)}
                          placeholder="Contoh: Akhlak Remaja"
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                        />
                      </>
                    )}
                  </div>

                  {articleType === "berita" ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Campaign Terkait</label>
                      <Select
                        value={selectedCampaignId || EMPTY_SELECT_VALUE}
                        onValueChange={(value) =>
                          setSelectedCampaignId(
                            value === EMPTY_SELECT_VALUE ? "" : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tanpa campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY_SELECT_VALUE}>
                            Tanpa campaign
                          </SelectItem>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Khusus berita, kamu bisa hubungkan konten ini ke campaign donasi tertentu.
                      </p>
                    </div>
                  ) : null}

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
          </section>

          <section className="rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Konten Artikel</h2>
              <p className="text-xs text-muted-foreground">
                Gambar di editor disimpan lokal dulu, lalu diupload ke Cloudflare R2 saat kamu menekan tombol simpan.
              </p>
            </div>
            <div className="p-5">
              <Editor
                html={content}
                onHtmlChange={setContent}
                placeholder="Tulis isi artikel atau berita di sini..."
                imageUploadFolder="articles/content"
                onPendingImageAdd={handlePendingContentImageAdd}
                onUploadError={setErrorMessage}
              />
            </div>
          </section>
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
