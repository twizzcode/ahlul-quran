"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, PencilLine, Plus, Search, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { uploadFileToR2 } from "@/lib/storage/upload-client";
import { formatDateTime } from "@/lib/utils";

export type DashboardGalleryImageItem = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

export type DashboardGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  imageCount: number;
  images: DashboardGalleryImageItem[];
};

type DashboardGalleryManagementProps = {
  initialGalleries: DashboardGalleryItem[];
};

type GalleryDialogMode = "create" | "edit";

type EditableGalleryImage = {
  url: string;
  caption: string;
};

const MAX_GALLERY_IMAGES = 10;

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function getGalleryDateValue(gallery?: DashboardGalleryItem) {
  return gallery?.createdAt ? gallery.createdAt.slice(0, 10) : getTodayDateValue();
}

function sortGalleriesByCreatedAt(items: DashboardGalleryItem[]) {
  return [...items].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
}

function createEmptyImage(): EditableGalleryImage {
  return {
    url: "",
    caption: "",
  };
}

function mapGalleryImages(gallery?: DashboardGalleryItem) {
  const savedImages =
    gallery?.images.map((image) => ({
      url: image.url,
      caption: image.caption || "",
    })) ?? [];

  return savedImages.length > 0 ? savedImages : [createEmptyImage()];
}

function GalleryFormDialog(props: {
  mode: GalleryDialogMode;
  gallery?: DashboardGalleryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (gallery: DashboardGalleryItem) => void;
  onUpdated: (gallery: DashboardGalleryItem) => void;
  onDeleted: (galleryId: string) => void;
}) {
  const { mode, gallery, open, onOpenChange, onCreated, onUpdated, onDeleted } = props;
  const [title, setTitle] = useState(gallery?.title || "");
  const [description, setDescription] = useState(gallery?.description || "");
  const [galleryDate, setGalleryDate] = useState(getGalleryDateValue(gallery));
  const [images, setImages] = useState<EditableGalleryImage[]>(mapGalleryImages(gallery));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(gallery?.title || "");
    setDescription(gallery?.description || "");
    setGalleryDate(getGalleryDateValue(gallery));
    setImages(mapGalleryImages(gallery));
    setErrorMessage("");
    setIsSubmitting(false);
    setIsDeleting(false);
    setIsUploadingImages(false);
  }, [gallery, open]);

  function removeImageSlot(index: number) {
    setImages((current) => {
      const nextImages = current.filter((_, currentIndex) => currentIndex !== index);

      if (nextImages.length === 0) {
        return [createEmptyImage()];
      }

      return nextImages;
    });
  }

  async function handleImagePickerChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const existingFilledImageCount = images.filter((image) => image.url.trim()).length;
    const availableSlots = MAX_GALLERY_IMAGES - existingFilledImageCount;

    if (files.length === 0) {
      return;
    }

    if (availableSlots <= 0) {
      setErrorMessage(`Maksimal ${MAX_GALLERY_IMAGES} foto per galeri.`);
      event.target.value = "";
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots);
    const invalidFile = acceptedFiles.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setErrorMessage("Semua file harus berupa gambar.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setIsUploadingImages(true);

    try {
      const uploadedUrls = await Promise.all(
        acceptedFiles.map((file) => uploadFileToR2(file, "galleries/images"))
      );

      setImages((current) => {
        const nextImages = current.filter((image) => image.url.trim().length > 0);
        uploadedUrls.forEach((url) => {
          if (nextImages.length < MAX_GALLERY_IMAGES) {
            nextImages.push({
              url,
              caption: "",
            });
          }
        });

        return nextImages.length > 0 ? nextImages : [createEmptyImage()];
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengupload gambar.");
    } finally {
      setIsUploadingImages(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (title.trim().length < 3) {
      setErrorMessage("Judul galeri minimal 3 karakter.");
      setIsSubmitting(false);
      return;
    }

    const filledImages = images
      .map((image) => ({
        url: image.url.trim(),
        caption: image.caption.trim(),
      }))
      .filter((image) => image.url.length > 0)
      .slice(0, MAX_GALLERY_IMAGES);

    if (filledImages.length === 0) {
      setErrorMessage("Tambahkan minimal 1 foto untuk galeri ini.");
      setIsSubmitting(false);
      return;
    }

    if (!galleryDate) {
      setErrorMessage("Tanggal galeri wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        mode === "create" ? "/api/galleries" : `/api/galleries/${gallery?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            createdAt: galleryDate,
            images: filledImages.map((image) => ({
              url: image.url,
              caption: image.caption || undefined,
            })),
          }),
        }
      );
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menyimpan galeri.");
      }

      const saved = result.data as {
        id: string;
        title: string;
        description: string | null;
        createdAt: string;
        updatedAt: string;
        _count: { images: number };
        images: DashboardGalleryImageItem[];
      };

      const nextGallery: DashboardGalleryItem = {
        id: saved.id,
        title: saved.title,
        description: saved.description,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        imageCount: saved._count.images,
        images: saved.images,
      };

      if (mode === "create") {
        onCreated(nextGallery);
        toast.success("Galeri berhasil dibuat.");
      } else {
        onUpdated(nextGallery);
        toast.success("Galeri berhasil diperbarui.");
      }

      onOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menyimpan galeri.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!gallery) {
      return;
    }

    const confirmed = window.confirm(`Hapus galeri "${gallery.title}"?`);
    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/galleries/${gallery.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Gagal menghapus galeri.");
      }

      onDeleted(gallery.id);
      toast.success("Galeri berhasil dihapus.");
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus galeri.");
    } finally {
      setIsDeleting(false);
    }
  }

  const filledImageCount = images.filter((image) => image.url.trim().length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hidden max-h-[90vh] overflow-y-auto p-0 sm:max-w-6xl">
        <DialogHeader className="border-b px-6 py-6">
          <DialogTitle>
            {mode === "create" ? "Tambah Galeri" : "Edit Galeri"}
          </DialogTitle>
          <DialogDescription>
            Setiap galeri bisa berisi maksimal 10 foto lengkap dengan judul, deskripsi, dan caption.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid items-start gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.2fr)_360px]"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImagePickerChange}
            />

            <section className="rounded-[24px] border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Foto Galeri</h2>
                  <p className="text-xs text-muted-foreground">
                    Upload banyak foto sekaligus, maksimal 10 gambar per galeri.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImages || filledImageCount >= MAX_GALLERY_IMAGES}
                >
                  {isUploadingImages ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Upload Foto
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {images
                  .filter((image) => image.url.trim().length > 0)
                  .map((image, index) => (
                    <div
                      key={`${gallery?.id || "new"}-${index}-${image.url}`}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 text-left transition hover:border-emerald-300"
                    >
                      <Image
                        src={image.url}
                        alt={image.caption || `Foto galeri ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-2 pt-6 text-[11px] font-medium text-white">
                        Foto {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeImageSlot(index);
                        }}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-100 backdrop-blur transition hover:bg-black/70"
                        aria-label={`Hapus foto ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                {filledImageCount < MAX_GALLERY_IMAGES ? (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-3 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    {isUploadingImages ? (
                      <LoaderCircle className="h-5 w-5 animate-spin text-emerald-700" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-emerald-700" />
                    )}
                    <span className="mt-2 text-xs font-medium text-emerald-800">
                      Tambah Foto
                    </span>
                  </button>
                ) : null}
              </div>
            </section>

            {errorMessage ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div
              className={`grid gap-3 ${
                mode === "edit" ? "sm:grid-cols-3" : "sm:grid-cols-2"
              }`}
            >
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="w-full"
                >
                  {isDeleting ? "Menghapus..." : "Hapus Galeri"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting} className="w-full">
                {isSubmitting
                  ? "Menyimpan..."
                  : mode === "create"
                    ? "Simpan Galeri"
                    : "Simpan Perubahan"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-6">
            <section className="rounded-[24px] border bg-card p-5 shadow-sm">
              <div className="mb-5 space-y-1">
                <h2 className="text-base font-semibold">Informasi Galeri</h2>
                <p className="text-xs text-muted-foreground">
                  Informasi ini akan tampil di halaman galeri publik. Foto pertama otomatis menjadi cover thumbnail galeri.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Judul</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    placeholder="Contoh: Kajian Ahad Pagi"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Tanggal</label>
                  <DatePickerField value={galleryDate} onChange={setGalleryDate} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    className="flex min-h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                    placeholder="Jelaskan momen atau kegiatan pada galeri ini..."
                  />
                </div>
              </div>
            </section>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DashboardGalleryManagement({
  initialGalleries,
}: DashboardGalleryManagementProps) {
  const [galleries, setGalleries] = useState(() => sortGalleriesByCreatedAt(initialGalleries));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<DashboardGalleryItem | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredGalleries = normalizedQuery
    ? galleries.filter((gallery) => {
        const searchableText = [
          gallery.title,
          gallery.description,
          ...gallery.images.map((image) => image.caption),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : galleries;

  function handleCreated(gallery: DashboardGalleryItem) {
    setGalleries((current) => sortGalleriesByCreatedAt([gallery, ...current]));
  }

  function handleUpdated(gallery: DashboardGalleryItem) {
    setGalleries((current) =>
      sortGalleriesByCreatedAt(
        current.map((item) => (item.id === gallery.id ? gallery : item))
      )
    );
  }

  function handleDeleted(galleryId: string) {
    setGalleries((current) => current.filter((item) => item.id !== galleryId));
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Galeri Foto</h1>
          <p className="text-sm text-muted-foreground">
            Kelola dokumentasi masjid. Setiap galeri bisa memuat sampai 10 foto.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Galeri
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {filteredGalleries.length} dari {galleries.length} galeri.
        </p>

        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari galeri..."
            className="h-11 rounded-xl pl-10 pr-11"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <GalleryFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />

      {filteredGalleries.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-base font-medium">
            {normalizedQuery ? "Galeri tidak ditemukan." : "Belum ada galeri."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {normalizedQuery
              ? "Coba gunakan kata kunci lain untuk menemukan galeri yang dicari."
              : "Tambahkan galeri dokumentasi pertama dari panel admin."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          {filteredGalleries.map((gallery) => {
            const image = gallery.images[0];

            return (
              <article
                key={gallery.id}
                className="overflow-hidden rounded-[18px] border border-emerald-100 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={image.caption || gallery.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Belum ada foto
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 p-3">
                  <div className="space-y-1">
                    <h2 className="line-clamp-2 text-sm font-semibold capitalize">
                      {gallery.title}
                    </h2>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {gallery.description?.trim() || "Tanpa deskripsi."}
                    </p>
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <p className="text-muted-foreground">
                        {formatDateTime(gallery.createdAt)}
                      </p>
                      <p className="font-medium text-emerald-800/80">
                        {gallery.imageCount} foto
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={() => setEditingGallery(gallery)}
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit Galeri
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <GalleryFormDialog
        mode="edit"
        gallery={editingGallery || undefined}
        open={!!editingGallery}
        onOpenChange={(open) => {
          if (!open) {
            setEditingGallery(null);
          }
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
