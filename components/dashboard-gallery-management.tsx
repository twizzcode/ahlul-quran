"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { PencilLine, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/components/dashboard-provider";
import { R2ImageUploadField } from "@/components/r2-image-upload-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  authorName: string;
  imageCount: number;
  images: DashboardGalleryImageItem[];
};

type DashboardGalleryManagementProps = {
  initialGalleries: DashboardGalleryItem[];
};

type GalleryDialogMode = "create" | "edit";

function GalleryFormDialog(props: {
  mode: GalleryDialogMode;
  gallery?: DashboardGalleryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (gallery: DashboardGalleryItem) => void;
  onUpdated: (gallery: DashboardGalleryItem) => void;
  onDeleted: (galleryId: string) => void;
}) {
  const { user } = useDashboard();
  const { mode, gallery, open, onOpenChange, onCreated, onUpdated, onDeleted } = props;
  const [title, setTitle] = useState(gallery?.title || "");
  const [description, setDescription] = useState(gallery?.description || "");
  const [imageUrl, setImageUrl] = useState(gallery?.images[0]?.url || "");
  const [imageCaption, setImageCaption] = useState(gallery?.images[0]?.caption || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(gallery?.title || "");
    setDescription(gallery?.description || "");
    setImageUrl(gallery?.images[0]?.url || "");
    setImageCaption(gallery?.images[0]?.caption || "");
    setErrorMessage("");
    setIsSubmitting(false);
    setIsDeleting(false);
  }, [gallery, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (title.trim().length < 3) {
      setErrorMessage("Judul galeri minimal 3 karakter.");
      setIsSubmitting(false);
      return;
    }

    if (!imageUrl.trim()) {
      setErrorMessage("Tambahkan 1 foto untuk item galeri ini.");
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
            images: [
              {
                url: imageUrl.trim(),
                caption: imageCaption.trim() || undefined,
              },
            ],
            authorId: user.id,
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
        author: { name: string };
        _count: { images: number };
        images: DashboardGalleryImageItem[];
      };

      const nextGallery: DashboardGalleryItem = {
        id: saved.id,
        title: saved.title,
        description: saved.description,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        authorName: saved.author.name,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>
            {mode === "create" ? "Tambah Foto Galeri" : "Edit Foto Galeri"}
          </DialogTitle>
          <DialogDescription>
            Satu item galeri hanya berisi satu foto beserta judul, deskripsi, dan caption.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid items-stretch gap-5 px-5 py-5 xl:grid-cols-[300px_minmax(0,1fr)]"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 space-y-1">
                <h2 className="text-base font-semibold">Foto Galeri</h2>
                <p className="text-xs text-muted-foreground">
                  Upload satu foto utama untuk item galeri ini.
                </p>
              </div>
              <R2ImageUploadField
                label=""
                value={imageUrl}
                folder="galleries/images"
                onChange={setImageUrl}
                onError={setErrorMessage}
              />
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

          <div>
            <section className="rounded-2xl border bg-card p-4 shadow-sm xl:h-full">
              <div className="mb-3 space-y-1">
                <h2 className="text-base font-semibold">Informasi Galeri</h2>
                <p className="text-xs text-muted-foreground">
                  Lengkapi informasi yang akan tampil di halaman galeri publik.
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
                  <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="flex min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                    placeholder="Jelaskan momen atau kegiatan pada foto ini..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Caption Foto</label>
                  <input
                    value={imageCaption}
                    onChange={(event) => setImageCaption(event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                    placeholder="Keterangan singkat foto"
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
  const [galleries, setGalleries] = useState(initialGalleries);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<DashboardGalleryItem | null>(null);

  function handleCreated(gallery: DashboardGalleryItem) {
    setGalleries((current) => [gallery, ...current]);
  }

  function handleUpdated(gallery: DashboardGalleryItem) {
    setGalleries((current) =>
      current.map((item) => (item.id === gallery.id ? gallery : item))
    );
  }

  function handleDeleted(galleryId: string) {
    setGalleries((current) => current.filter((item) => item.id !== galleryId));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Galeri Foto</h1>
          <p className="text-sm text-muted-foreground">
            Kelola foto-foto dokumentasi masjid yang tampil di halaman galeri publik.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Foto
        </Button>
      </div>

      <GalleryFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />

      {galleries.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-base font-medium">Belum ada foto galeri.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tambahkan foto dokumentasi pertama dari panel admin.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          {galleries.map((gallery) => {
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
                    {image?.caption ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {image.caption}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/20 p-2 text-[11px]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Editor
                      </p>
                      <p className="mt-1 line-clamp-1 font-semibold">{gallery.authorName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Update
                      </p>
                      <p className="mt-1 line-clamp-2 font-semibold">{formatDateTime(gallery.updatedAt)}</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={() => setEditingGallery(gallery)}
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit Foto
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
