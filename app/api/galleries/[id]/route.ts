import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { gallery, galleryImage } from "@/src/db/schema";

const MAX_GALLERY_IMAGES = 10;

function normalizeGalleryDate(input: unknown) {
  const value = typeof input === "string" ? input.trim() : "";

  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeGalleryImages(input: unknown) {
  const images = Array.isArray(input) ? input : [];

  return images
    .map((image, index) => ({
      url:
        image && typeof image === "object" && "url" in image
          ? String(image.url ?? "").trim()
          : "",
      caption:
        image && typeof image === "object" && "caption" in image && image.caption
          ? String(image.caption).trim()
          : null,
      order: index,
    }))
    .filter((image) => image.url.length > 0)
    .slice(0, MAX_GALLERY_IMAGES);
}

async function formatGalleryResponse(id: string) {
  const saved = await db.query.gallery.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      images: true,
    },
  });

  if (!saved) return null;

  return {
    id: saved.id,
    title: saved.title,
    description: saved.description,
    createdAt: saved.createdAt.toISOString(),
    updatedAt: saved.updatedAt.toISOString(),
    _count: { images: saved.images.length },
    images: saved.images.sort((a, b) => a.order - b.order).map((image) => ({
      id: image.id,
      url: image.url,
      caption: image.caption,
      order: image.order,
    })),
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const description = payload.description ? String(payload.description).trim() : null;
  const createdAt = normalizeGalleryDate(payload.createdAt);
  const images = normalizeGalleryImages(payload.images);

  if (title.length < 3 || images.length === 0 || !createdAt) {
    return apiError("Data galeri tidak valid.", 400);
  }

  const [updated] = await db
    .update(gallery)
    .set({ title, description, createdAt, updatedAt: new Date() })
    .where(eq(gallery.id, id))
    .returning({ id: gallery.id });
  if (!updated) {
    return apiError("Galeri tidak ditemukan.", 404);
  }

  await db.delete(galleryImage).where(eq(galleryImage.galleryId, id));
  await db.insert(galleryImage).values(
    images.map((image) => ({
      id: crypto.randomUUID(),
      url: image.url,
      caption: image.caption,
      order: image.order,
      galleryId: id,
    }))
  );

  const saved = await formatGalleryResponse(id);
  return apiSuccess(saved, "Galeri berhasil diperbarui.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const [deleted] = await db.delete(gallery).where(eq(gallery.id, id)).returning({ id: gallery.id });
  if (!deleted) {
    return apiError("Galeri tidak ditemukan.", 404);
  }

  return apiSuccess({ id }, "Galeri berhasil dihapus.");
}
