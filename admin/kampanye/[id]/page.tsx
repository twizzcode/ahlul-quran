import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardCampaignDetail } from "@/components/dashboard-campaign-detail";
import {
  type DashboardCampaignItem,
  type DashboardCampaignLinkedArticle,
  type DashboardDonationItem,
} from "@/components/dashboard-donation-management";
import { isDonationCampaignUpdateSchemaMismatchError } from "@/lib/donation-campaign-updates";

type DashboardKampanyeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

type CampaignRaw = {
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
};

export default async function DashboardKampanyeDetailPage({
  params,
}: DashboardKampanyeDetailPageProps) {
  const { id } = await params;

  let campaignRaw: CampaignRaw | null = null;

  const donationsRaw = await prisma.donation.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  try {
    campaignRaw = await prisma.donationCampaign.findUnique({
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

    campaignRaw = await prisma.donationCampaign.findUnique({
      where: { id },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: { amount: true },
        },
      },
    });
  }

  if (!campaignRaw) {
    notFound();
  }

  const collectedAmount = campaignRaw.donations.reduce((sum, item) => sum + item.amount, 0);
  const progress =
    campaignRaw.targetAmount > 0
      ? Math.min(100, Math.round((collectedAmount / campaignRaw.targetAmount) * 100))
      : 0;

  const campaign: DashboardCampaignItem = {
    id: campaignRaw.id,
    title: campaignRaw.title,
    slug: campaignRaw.slug,
    description: campaignRaw.description,
    coverImage: campaignRaw.coverImage,
    targetAmount: campaignRaw.targetAmount,
    collectedAmount,
    progress,
    donationCount: campaignRaw.donations.length,
    isActive: campaignRaw.isActive,
    endDate: campaignRaw.endDate ? campaignRaw.endDate.toISOString() : null,
    createdAt: campaignRaw.createdAt.toISOString(),
    linkedArticles: (campaignRaw.updates ?? []).map(
      (article): DashboardCampaignLinkedArticle => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
      })
    ),
  };

  const donations: DashboardDonationItem[] = donationsRaw.map((donation) => ({
    id: donation.id,
    orderId: donation.orderId,
    donorName: donation.isAnonymous ? "Hamba Allah" : donation.donorName,
    amount: donation.amount,
    paymentType: donation.paymentType,
    status: donation.status,
    createdAt: donation.createdAt.toISOString(),
    campaignId: donation.campaignId,
    campaignTitle: campaignRaw.title,
  }));

  return (
    <DashboardCampaignDetail
      campaign={campaign}
      donations={donations}
    />
  );
}
