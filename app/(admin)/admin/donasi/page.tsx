import { desc, eq } from "drizzle-orm";
import { DashboardDonationManagement, type DashboardCampaignItem, type DashboardDonationItem } from "@/components/dashboard/donations/dashboard-donation-management";
import { db } from "@/src";
import { donation, donationCampaign } from "@/src/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardDonasiPage() {
  const [donationsRaw, campaignsRaw] = await Promise.all([
    db.query.donation.findMany({
      with: {
        campaign: { columns: { id: true, title: true } },
      },
      orderBy: [desc(donation.createdAt)],
      limit: 200,
    }),
    db.query.donationCampaign.findMany({
      with: {
        donations: {
          where: eq(donation.status, "SUCCESS"),
          columns: { amount: true },
        },
      },
      orderBy: [desc(donationCampaign.createdAt)],
    }),
  ]);

  const campaigns: DashboardCampaignItem[] = campaignsRaw.map((campaign) => {
    const collectedAmount = campaign.donations.reduce((sum, item) => sum + item.amount, 0);
    const progress = campaign.targetAmount > 0 ? Math.min(100, Math.round((collectedAmount / campaign.targetAmount) * 100)) : 0;

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
      linkedGalleries: [],
    };
  });

  const donations: DashboardDonationItem[] = donationsRaw.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    donorName: item.isAnonymous ? "Hamba Allah" : item.donorName,
    amount: item.amount,
    paymentType: item.paymentType,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    campaignId: item.campaign?.id ?? null,
    campaignTitle: item.campaign?.title ?? null,
  }));

  return <DashboardDonationManagement mode="donations" initialCampaigns={campaigns} initialDonations={donations} />;
}
