import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import type { PublicArticleType } from "@/lib/content/public-articles";
import { apiError, apiSuccess, generateSlug } from "@/lib/utils";
import { db } from "@/src";
import { article, articleCategory } from "@/src/db/schema";

async function resolveCategoryId(categoryId?: string | null, categoryName?: string | null) {
  if (categoryName?.trim()) {
    const name = categoryName.trim();
    let slug = generateSlug(name) || crypto.randomUUID().slice(0, 8);
    let counter = 1;
    while (await db.query.articleCategory.findFirst({ where: eq(articleCategory.slug, slug), columns: { id: true } })) {
      slug = `${generateSlug(name)}-${counter}`;
      counter += 1;
    }

    const [created] = await db.insert(articleCategory).values({
      id: crypto.randomUUID(),
      name,
      slug,
    }).returning({ id: articleCategory.id });

    return created.id;
  }

  return categoryId?.trim() || null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { slug } = await params;
  const existing = await db.query.article.findFirst({ where: eq(article.slug, slug) });
  if (!existing) {
    return apiError("Artikel tidak ditemukan.", 404);
  }

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const content = String(payload.content ?? "").trim();
  const excerpt = payload.excerpt ? String(payload.excerpt).trim() : null;
  const coverImage = payload.coverImage ? String(payload.coverImage).trim() : null;
  const type: PublicArticleType = payload.type === "berita" ? "berita" : "artikel";
  const categoryId = await resolveCategoryId(payload.categoryId, payload.categoryName);

  if (title.length < 3 || content.length < 10) {
    return apiError("Data artikel tidak valid.", 400);
  }

  const [updated] = await db.update(article).set({
    title,
    excerpt,
    content,
    coverImage,
    type,
    categoryId,
    donationCampaignId: type === "berita" ? (payload.donationCampaignId ? String(payload.donationCampaignId).trim() : null) : null,
    updatedAt: new Date(),
  }).where(eq(article.slug, slug)).returning();

  return apiSuccess(updated, `${type === "berita" ? "Berita" : "Artikel"} berhasil diperbarui.`);
}
