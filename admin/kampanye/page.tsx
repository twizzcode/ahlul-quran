import prisma from "@/lib/prisma";
import {
  DashboardDonationManagement,
  type DashboardCampaignItem,
  type DashboardCampaignLinkedArticle,
  type DashboardDonationItem,
} from "@/components/dashboard-donation-management";
import { isDonationCampaignUpdateSchemaMismatchError } from "@/lib/donation-campaign-updates";

export const dynamic = "force-dynamic";

export default async function DashboardKampanyePage() {
  let campaignsRaw: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    targetAmount: number;
    isActive: boolean;
    endDate: Date | null;
    createdAt: Date;
    donations: Array<{ amount: number }>;
    updates?: Array<{
      id: string;
      title: string;
      slug: string;
      publishedAt: Date | null;
      createdAt: Date;
    }>;
  }> = [];

  const donationsRaw = await prisma.donation.findMany({
    include: {
      campaign: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  try {
    campaignsRaw = await prisma.donationCampaign.findMany({
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
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    if (!isDonationCampaignUpdateSchemaMismatchError(error)) {
      throw error;
    }

    campaignsRaw = await prisma.donationCampaign.findMany({
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const campaigns: DashboardCampaignItem[] = campaignsRaw.map((campaign) => {
    const collectedAmount = campaign.donations.reduce((sum, item) => sum + item.amount, 0);
    const progress =
      campaign.targetAmount > 0
        ? Math.min(100, Math.round((collectedAmount / campaign.targetAmount) * 100))
        : 0;

    return {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description,
      coverImage: campaign.coverImage,
      targetAmount: campaign.targetAmount,
      collectedAmount,
      progress,
      donationCount: campaign.donations.length,
      isActive: campaign.isActive,
      endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
      createdAt: campaign.createdAt.toISOString(),
      linkedArticles: (campaign.updates ?? []).map(
        (article): DashboardCampaignLinkedArticle => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
        })
      ),
    };
  });

  const donations: DashboardDonationItem[] = donationsRaw.map((donation) => ({
    id: donation.id,
    orderId: donation.orderId,
    donorName: donation.isAnonymous ? "Hamba Allah" : donation.donorName,
    amount: donation.amount,
    paymentType: donation.paymentType,
    status: donation.status,
    createdAt: donation.createdAt.toISOString(),
    campaignId: donation.campaign?.id ?? null,
    campaignTitle: donation.campaign?.title ?? null,
  }));

  return (
    <DashboardDonationManagement
      mode="campaigns"
      initialCampaigns={campaigns}
      initialDonations={donations}
    />
  );
}
