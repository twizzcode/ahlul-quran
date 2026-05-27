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

export async function POST(request: Request) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const description = payload.description ? String(payload.description).trim() : null;
  const images = Array.isArray(payload.images) ? payload.images : [];
  const firstImage = images[0];

  if (title.length < 3 || !firstImage?.url) {
    return apiError("Data galeri tidak valid.", 400);
  }

  const id = crypto.randomUUID();
  await db.insert(gallery).values({
    id,
    title,
    description,
    authorId: context.user.id,
  });
  await db.insert(galleryImage).values({
    id: crypto.randomUUID(),
    url: String(firstImage.url).trim(),
    caption: firstImage.caption ? String(firstImage.caption).trim() : null,
    order: 0,
    galleryId: id,
  });

  const saved = await formatGalleryResponse(id);
  return apiSuccess(saved, "Galeri berhasil dibuat.");
}
