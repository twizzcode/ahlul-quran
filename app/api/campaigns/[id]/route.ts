import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { isDonationCampaignUpdateSchemaMismatchError } from "@/lib/donation-campaign-updates";
import { apiSuccess, apiError } from "@/lib/utils";
import { updateCampaignSchema } from "@/lib/validators";

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

type CampaignDetailResult = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  donations: Array<{ amount: number }>;
  updates?: Array<{
    id: string;
    title: string;
    slug: string;
    publishedAt: Date | null;
    createdAt: Date;
  }>;
} | null;

// ============================================================
// GET /api/campaigns/[id] - Detail campaign
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let campaign: CampaignDetailResult;

    try {
      campaign = await prisma.donationCampaign.findUnique({
        where: { id },
        include: {
          donations: {
            where: { status: "SUCCESS" },
            select: { amount: true },
          },
          updates: {
            select: {
              id: true,
              title: true,
              slug: true,
              publishedAt: true,
              createdAt: true,
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          },
        },
      });
    } catch (error) {
      if (!isDonationCampaignUpdateSchemaMismatchError(error)) {
        throw error;
      }

      campaign = await prisma.donationCampaign.findUnique({
        where: { id },
        include: {
          donations: {
            where: { status: "SUCCESS" },
            select: { amount: true },
          },
        },
      });
    }

    if (!campaign) {
      return apiError("Kampanye tidak ditemukan", 404);
    }

    const collectedAmount = campaign.donations.reduce((sum, item) => sum + item.amount, 0);
    const linkedArticles = campaign.updates ?? [];

    return apiSuccess({
      ...campaign,
      collectedAmount,
      donationCount: campaign.donations.length,
      linkedArticles: linkedArticles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      })),
      donations: undefined,
      updates: undefined,
    });
  } catch (error) {
    console.error("Error fetching campaign detail:", error);
    return apiError("Gagal mengambil detail kampanye", 500);
  }
}

// ============================================================
// PATCH /api/campaigns/[id] - Update campaign
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const hasLinkedArticleIds = Object.prototype.hasOwnProperty.call(body, "linkedArticleIds");

    const normalizedBody = {
      ...body,
      endDate: body.endDate === "" ? null : body.endDate,
    };

    const validated = updateCampaignSchema
      .extend({
        endDate: updateCampaignSchema.shape.endDate.nullable().optional(),
      })
      .parse(normalizedBody);
    const linkedArticleIds = hasLinkedArticleIds
      ? Array.from(new Set(validated.linkedArticleIds ?? []))
      : null;
    const linkedArticles = linkedArticleIds
      ? await getLinkedArticles(linkedArticleIds)
      : await prisma.article.findMany({
          where: {
            donationCampaignId: id,
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

    const campaign = await prisma.$transaction(async (tx) => {
      const updatedCampaign = await tx.donationCampaign.update({
        where: { id },
        data: {
          title: validated.title,
          description: validated.description,
          coverImage: validated.coverImage,
          targetAmount: validated.targetAmount,
          isActive: validated.isActive,
          startDate: validated.startDate ? new Date(validated.startDate) : undefined,
          endDate:
            validated.endDate === null
              ? null
              : validated.endDate
                ? new Date(validated.endDate)
                : undefined,
        },
      });

      if (linkedArticleIds) {
        await tx.article.updateMany({
          where: { donationCampaignId: id },
          data: { donationCampaignId: null },
        });

        if (linkedArticleIds.length > 0) {
          await tx.article.updateMany({
            where: { id: { in: linkedArticleIds } },
            data: { donationCampaignId: id },
          });
        }
      }

      return updatedCampaign;
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
      "Kampanye berhasil diperbarui"
    );
  } catch (error) {
    console.error("Error updating campaign:", error);
    if (isDonationCampaignUpdateSchemaMismatchError(error)) {
      return apiError(
        "Skema database donasi belum sinkron dengan fitur update kampanye. Jalankan migrasi database terlebih dahulu.",
        500
      );
    }
    if (error instanceof Error) {
      return apiError(error.message, 400);
    }
    return apiError("Gagal memperbarui kampanye", 500);
  }
}

// ============================================================
// DELETE /api/campaigns/[id] - Delete campaign
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const campaign = await prisma.donationCampaign.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!campaign) {
      return apiError("Kampanye tidak ditemukan", 404);
    }

    await prisma.$transaction([
      prisma.article.updateMany({
        where: { donationCampaignId: id },
        data: { donationCampaignId: null },
      }),
      prisma.donation.updateMany({
        where: { campaignId: id },
        data: { campaignId: null },
      }),
      prisma.donationCampaign.delete({
        where: { id },
      }),
    ]);

    return apiSuccess(null, "Kampanye berhasil dihapus");
  } catch (error) {
    console.error("Error deleting campaign:", error);
    if (isDonationCampaignUpdateSchemaMismatchError(error)) {
      await prisma.$transaction([
        prisma.donation.updateMany({
          where: { campaignId: id },
          data: { campaignId: null },
        }),
        prisma.donationCampaign.delete({
          where: { id },
        }),
      ]);

      return apiSuccess(
        null,
        "Kampanye berhasil dihapus, tetapi relasi update berita belum tersedia di database aktif."
      );
    }
    return apiError("Gagal menghapus kampanye", 500);
  }
}
