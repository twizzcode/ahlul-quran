import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { getExplicitArticleType } from "@/lib/content/public-articles";
import { apiError, apiSuccess, generateSlug } from "@/lib/utils";
import { db } from "@/src";
import { article, articleCategory } from "@/src/db/schema";

async function ensureUniqueArticleSlug(base: string) {
  let slug = generateSlug(base) || crypto.randomUUID().slice(0, 8);
  let counter = 1;

  while (await db.query.article.findFirst({ where: eq(article.slug, slug), columns: { id: true } })) {
    slug = `${generateSlug(base)}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function resolveCategoryId(categoryId?: string | null, categoryName?: string | null) {
  if (categoryName?.trim()) {
    const name = categoryName.trim();
    const slug = await (async () => {
      let value = generateSlug(name) || crypto.randomUUID().slice(0, 8);
      let counter = 1;
      while (await db.query.articleCategory.findFirst({ where: eq(articleCategory.slug, value), columns: { id: true } })) {
        value = `${generateSlug(name)}-${counter}`;
        counter += 1;
      }
      return value;
    })();

    const [created] = await db.insert(articleCategory).values({
      id: crypto.randomUUID(),
      name,
      slug,
    }).returning({ id: articleCategory.id });

    return created.id;
  }

  return categoryId?.trim() || null;
}

export async function POST(request: Request) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const content = String(payload.content ?? "").trim();
  const excerpt = payload.excerpt ? String(payload.excerpt).trim() : null;
  const coverImage = payload.coverImage ? String(payload.coverImage).trim() : null;
  const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
  const donationCampaignId = payload.donationCampaignId ? String(payload.donationCampaignId).trim() : null;

  if (title.length < 3 || content.length < 10) {
    return apiError("Data artikel tidak valid.", 400);
  }

  const slug = await ensureUniqueArticleSlug(title);
  const categoryId = await resolveCategoryId(payload.categoryId, payload.categoryName);
  const articleType = getExplicitArticleType(tags) ?? "artikel";
  const publishedAt = new Date();

  const [created] = await db.insert(article).values({
    id: crypto.randomUUID(),
    title,
    slug,
    excerpt,
    content,
    coverImage,
    status: "PUBLISHED",
    publishedAt,
    authorId: context.user.id,
    categoryId,
    donationCampaignId: articleType === "berita" ? donationCampaignId : null,
    tags,
  }).returning();

  return apiSuccess(created, "Artikel berhasil dibuat.");
}
