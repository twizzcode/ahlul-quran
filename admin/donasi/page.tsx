import prisma from "@/lib/prisma";
import {
  DashboardDonationManagement,
  type DashboardCampaignItem,
  type DashboardDonationItem,
} from "@/components/dashboard-donation-management";

export const dynamic = "force-dynamic";

export default async function DashboardDonasiPage() {
  const [donationsRaw, campaignsRaw] = await Promise.all([
    prisma.donation.findMany({
      include: {
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.donationCampaign.findMany({
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

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
      linkedArticles: [],
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
      mode="donations"
      initialCampaigns={campaigns}
      initialDonations={donations}
    />
  );
}
