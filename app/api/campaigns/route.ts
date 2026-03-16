import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { isDonationCampaignUpdateSchemaMismatchError } from "@/lib/donation-campaign-updates";
import { apiSuccess, apiError, apiPaginated, generateSlug } from "@/lib/utils";
import { createCampaignSchema } from "@/lib/validators";

async function getLinkedArticles(linkedArticleIds: string[]) {
  if (linkedArticleIds.length === 0) {
    return [];
  }

  const articles = await prisma.article.findMany({
    where: {
      id: { in: linkedArticleIds },
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  if (articles.length !== linkedArticleIds.length) {
    throw new Error("Beberapa berita yang dipilih tidak ditemukan atau belum dipublikasikan.");
  }

  return articles;
}

// ============================================================
// GET /api/campaigns - List campaigns
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (active === "true") {
      where.isActive = true;
    }

    const [campaigns, total] = await Promise.all([
      prisma.donationCampaign.findMany({
        where,
        include: {
          _count: { select: { donations: true } },
          donations: {
            where: { status: "SUCCESS" },
            select: { amount: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donationCampaign.count({ where }),
    ]);

    // Calculate collected amounts
    const result = campaigns.map((c) => ({
      ...c,
      collectedAmount: c.donations.reduce((sum, d) => sum + d.amount, 0),
      donationCount: c._count.donations,
      donations: undefined,
      _count: undefined,
    }));

    return apiPaginated(result, total, page, limit);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return apiError("Gagal mengambil data kampanye", 500);
  }
}

// ============================================================
// POST /api/campaigns - Create campaign (admin only)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCampaignSchema.parse(body);
    const linkedArticleIds = Array.from(new Set(validated.linkedArticleIds ?? []));

    const slug = generateSlug(validated.title);
    const existing = await prisma.donationCampaign.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;
    const linkedArticles = await getLinkedArticles(linkedArticleIds);

    const campaign = await prisma.$transaction(async (tx) => {
      const createdCampaign = await tx.donationCampaign.create({
        data: {
          title: validated.title,
          description: validated.description,
          coverImage: validated.coverImage,
          targetAmount: validated.targetAmount,
          isActive: validated.isActive,
          slug: finalSlug,
          startDate: validated.startDate ? new Date(validated.startDate) : new Date(),
          endDate: validated.endDate ? new Date(validated.endDate) : null,
        },
      });

      if (linkedArticleIds.length > 0) {
        await tx.article.updateMany({
          where: { id: { in: linkedArticleIds } },
          data: { donationCampaignId: createdCampaign.id },
        });
      }

      return createdCampaign;
    });

    return apiSuccess(
      {
        ...campaign,
        linkedArticles: linkedArticles.map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
        })),
      },
      "Kampanye berhasil dibuat"
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    if (isDonationCampaignUpdateSchemaMismatchError(error)) {
      return apiError(
        "Skema database donasi belum sinkron dengan fitur update kampanye. Jalankan migrasi database terlebih dahulu.",
        500
      );
    }
    if (error instanceof Error) {
      return apiError(error.message, 400);
    }
    return apiError("Gagal membuat kampanye", 500);
  }
}
