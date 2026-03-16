import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiPaginated, generateSlug } from "@/lib/utils";
import { createArticleSchema } from "@/lib/validators";

async function resolveCategoryId(input: {
  categoryId?: string;
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

  return input.categoryId || null;
}

// ============================================================
// GET /api/articles - List articles (public)
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "PUBLISHED";
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return apiPaginated(articles, total, page, limit);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return apiError("Gagal mengambil data artikel", 500);
  }
}

// ============================================================
// POST /api/articles - Create article (admin only)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const normalizedBody = {
      ...body,
      categoryId: body.categoryId === "" ? undefined : body.categoryId,
      donationCampaignId:
        body.donationCampaignId === "" ? undefined : body.donationCampaignId,
    };
    const validated = createArticleSchema.parse(normalizedBody);
    const categoryId = await resolveCategoryId({
      categoryId: validated.categoryId,
      categoryName: typeof body.categoryName === "string" ? body.categoryName : undefined,
    });

    const slug = generateSlug(validated.title);

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
    let authorId = typeof body.authorId === "string" ? body.authorId : "";

    if (!authorId) {
      const fallbackAuthor = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!fallbackAuthor) {
        return apiError("Tidak ada user untuk menjadi penulis artikel", 400);
      }

      authorId = fallbackAuthor.id;
    }

    const article = await prisma.article.create({
      data: {
        ...validated,
        slug: finalSlug,
        categoryId,
        donationCampaignId: validated.donationCampaignId,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: true,
      },
    });

    return apiSuccess(article, "Artikel berhasil dibuat");
  } catch (error) {
    console.error("Error creating article:", error);
    return apiError("Gagal membuat artikel", 500);
  }
}
