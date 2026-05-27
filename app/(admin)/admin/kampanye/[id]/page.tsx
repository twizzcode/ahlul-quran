import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { DashboardCampaignDetail } from "@/components/dashboard/donations/dashboard-campaign-detail";
import { type DashboardCampaignItem, type DashboardCampaignLinkedArticle, type DashboardDonationItem } from "@/components/dashboard/donations/dashboard-donation-management";
import { db } from "@/src";
import { article, donation } from "@/src/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardKampanyeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [campaignRaw, donationsRaw] = await Promise.all([
    db.query.donationCampaign.findFirst({
      where: (table, { or, eq: eqFn }) => or(eqFn(table.id, id), eqFn(table.slug, id)),
      with: {
        donations: {
          where: eq(donation.status, "SUCCESS"),
          columns: { amount: true },
        },
        updates: {
          columns: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
            createdAt: true,
          },
          orderBy: [desc(article.publishedAt), desc(article.createdAt)],
        },
      },
    }),
    db.query.donation.findMany({
      with: {
        campaign: { columns: { id: true, title: true } },
      },
      orderBy: [desc(donation.createdAt)],
      limit: 100,
    }),
  ]);

  if (!campaignRaw) {
    notFound();
  }

  const relevantDonations = donationsRaw.filter((item) => item.campaignId === campaignRaw.id);
  const collectedAmount = campaignRaw.donations.reduce((sum, item) => sum + item.amount, 0);
  const progress = campaignRaw.targetAmount > 0 ? Math.min(100, Math.round((collectedAmount / campaignRaw.targetAmount) * 100)) : 0;

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
    linkedArticles: campaignRaw.updates.map(
      (item): DashboardCampaignLinkedArticle => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        publishedAt: (item.publishedAt ?? item.createdAt).toISOString(),
      }),
    ),
  };

  const donations: DashboardDonationItem[] = relevantDonations.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    donorName: item.isAnonymous ? "Hamba Allah" : item.donorName,
    amount: item.amount,
    paymentType: item.paymentType,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    campaignId: item.campaignId,
    campaignTitle: campaignRaw.title,
  }));

  return <DashboardCampaignDetail campaign={campaign} donations={donations} />;
}
