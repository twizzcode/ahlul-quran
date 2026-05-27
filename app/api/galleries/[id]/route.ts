import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { gallery, galleryImage } from "@/src/db/schema";

async function formatGalleryResponse(id: string) {
  const saved = await db.query.gallery.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      author: { columns: { name: true } },
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
    author: { name: saved.author.name },
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
  const images = Array.isArray(payload.images) ? payload.images : [];
  const firstImage = images[0];

  if (title.length < 3 || !firstImage?.url) {
    return apiError("Data galeri tidak valid.", 400);
  }

  const [updated] = await db.update(gallery).set({ title, description, updatedAt: new Date() }).where(eq(gallery.id, id)).returning({ id: gallery.id });
  if (!updated) {
    return apiError("Galeri tidak ditemukan.", 404);
  }

  const existingImage = await db.query.galleryImage.findFirst({ where: eq(galleryImage.galleryId, id) });
  if (existingImage) {
    await db.update(galleryImage).set({
      url: String(firstImage.url).trim(),
      caption: firstImage.caption ? String(firstImage.caption).trim() : null,
      order: 0,
    }).where(eq(galleryImage.id, existingImage.id));
  } else {
    await db.insert(galleryImage).values({
      id: crypto.randomUUID(),
      url: String(firstImage.url).trim(),
      caption: firstImage.caption ? String(firstImage.caption).trim() : null,
      order: 0,
      galleryId: id,
    });
  }

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
