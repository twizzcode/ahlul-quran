import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  deleteUnusedArticleAssets,
  getManagedArticleAssetUrls,
  getRemovedArticleAssetUrls,
} from "@/lib/article-assets";
import { apiSuccess, apiError, generateSlug } from "@/lib/utils";
import { updateArticleSchema } from "@/lib/validators";

async function resolveCategoryId(input: {
  categoryId?: string | null;
  categoryName?: string;
}) {
  const categoryName = input.categoryName?.trim();

  if (categoryName) {
    const slug = generateSlug(categoryName);
    const existing = await prisma.articleCategory.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await prisma.articleCategory.create({
      data: {
        name: categoryName,
        slug,
      },
      select: { id: true },
    });

    return created.id;
  }

  if (input.categoryId === null) {
    return null;
  }

  return input.categoryId;
}

// ============================================================
// GET /api/articles/[slug] - Get single article
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: true,
      },
    });

    if (!article) {
      return apiError("Artikel tidak ditemukan", 404);
    }

    // Increment view count
    await prisma.article.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return apiSuccess(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return apiError("Gagal mengambil data artikel", 500);
  }
}

// ============================================================
// PATCH /api/articles/[slug] - Update article
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const normalizedBody = {
      ...body,
      categoryId: body.categoryId === "" ? null : body.categoryId,
      coverImage: body.coverImage === "" ? null : body.coverImage,
      donationCampaignId:
        body.donationCampaignId === "" ? null : body.donationCampaignId,
    };
    const validated = updateArticleSchema
      .extend({
        categoryId: z.string().nullable().optional(),
        coverImage: z.string().url().nullable().optional(),
        donationCampaignId: z.string().nullable().optional(),
      })
      .parse(normalizedBody);
    const categoryId = await resolveCategoryId({
      categoryId: validated.categoryId,
      categoryName: typeof body.categoryName === "string" ? body.categoryName : undefined,
    });
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        content: true,
        coverImage: true,
        publishedAt: true,
      },
    });

    if (!existingArticle) {
      return apiError("Artikel tidak ditemukan", 404);
    }

    const article = await prisma.article.update({
      where: { slug },
      data: {
        ...validated,
        categoryId,
        donationCampaignId: validated.donationCampaignId,
        status: "PUBLISHED",
        publishedAt: existingArticle?.publishedAt ?? new Date(),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: true,
      },
    });

    const removedUrls = getRemovedArticleAssetUrls(
      {
        content: existingArticle.content,
        coverImage: existingArticle.coverImage,
      },
      {
        content: article.content,
        coverImage: article.coverImage,
      },
    )

    await deleteUnusedArticleAssets(removedUrls, article.id)

    return apiSuccess(article, "Artikel berhasil diperbarui");
  } catch (error) {
    console.error("Error updating article:", error);
    return apiError("Gagal memperbarui artikel", 500);
  }
}

// ============================================================
// DELETE /api/articles/[slug] - Delete article
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        content: true,
        coverImage: true,
      },
    });

    if (!existingArticle) {
      return apiError("Artikel tidak ditemukan", 404);
    }

    const managedUrls = [...getManagedArticleAssetUrls(existingArticle)];

    await prisma.article.delete({ where: { slug } });
    await deleteUnusedArticleAssets(managedUrls)
    return apiSuccess(null, "Artikel berhasil dihapus");
  } catch (error) {
    console.error("Error deleting article:", error);
    return apiError("Gagal menghapus artikel", 500);
  }
}
