import { eq, inArray } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess, generateSlug } from "@/lib/utils";
import { db } from "@/src";
import { donationCampaign, gallery } from "@/src/db/schema";

async function ensureUniqueCampaignSlug(base: string) {
  let slug = generateSlug(base) || crypto.randomUUID().slice(0, 8);
  let counter = 1;

  while (await db.query.donationCampaign.findFirst({ where: eq(donationCampaign.slug, slug), columns: { id: true } })) {
    slug = `${generateSlug(base)}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function POST(request: Request) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const targetAmount = Number(payload.targetAmount);
  const linkedGalleryIds = Array.isArray(payload.linkedGalleryIds)
    ? payload.linkedGalleryIds
        .map((item: unknown) => String(item ?? "").trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  if (title.length < 3 || description.length < 10 || !Number.isFinite(targetAmount) || targetAmount < 100000) {
    return apiError("Data kampanye tidak valid.", 400);
  }

  const [created] = await db.insert(donationCampaign).values({
    id: crypto.randomUUID(),
    title,
    slug: await ensureUniqueCampaignSlug(title),
    description,
    coverImage: payload.coverImage ? String(payload.coverImage).trim() : null,
    targetAmount,
    isActive: payload.isActive !== false,
    endDate: payload.endDate ? new Date(String(payload.endDate)) : null,
  }).returning();

  if (linkedGalleryIds.length > 0) {
    await db
      .update(gallery)
      .set({ donationCampaignId: created.id })
      .where(inArray(gallery.id, linkedGalleryIds));
  }

  const linkedGalleries = linkedGalleryIds.length
    ? await db.query.gallery.findMany({
        where: inArray(gallery.id, linkedGalleryIds),
        with: {
          images: true,
        },
      })
    : [];

  return apiSuccess({
    ...created,
    endDate: created.endDate ? created.endDate.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    linkedArticles: [],
    linkedGalleries: linkedGalleries.map((item) => ({
      id: item.id,
      title: item.title,
      createdAt: item.createdAt.toISOString(),
      imageCount: item.images.length,
      coverImage: item.images.sort((a, b) => a.order - b.order)[0]?.url ?? null,
    })),
  }, "Kampanye berhasil dibuat.");
}
