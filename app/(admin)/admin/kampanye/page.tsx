import { asc, desc, eq, isNull } from "drizzle-orm";
import { DashboardDonationManagement, type DashboardCampaignGalleryOption, type DashboardCampaignItem, type DashboardCampaignLinkedArticle, type DashboardCampaignLinkedGallery, type DashboardDonationItem } from "@/components/dashboard/donations/dashboard-donation-management";
import { db } from "@/src";
import { article, donation, donationCampaign, gallery } from "@/src/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardKampanyePage() {
  const [donationsRaw, campaignsRaw, galleriesRaw] = await Promise.all([
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
        galleries: {
          with: {
            images: true,
          },
          orderBy: (table, { asc: orderAsc }) => [orderAsc(table.createdAt)],
        },
      },
      orderBy: [desc(donationCampaign.createdAt)],
    }),
    db.query.gallery.findMany({
      where: isNull(gallery.donationCampaignId),
      with: { images: true },
      orderBy: [asc(gallery.createdAt)],
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
      linkedArticles: campaign.updates.map(
        (item): DashboardCampaignLinkedArticle => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          publishedAt: (item.publishedAt ?? item.createdAt).toISOString(),
        }),
      ),
      linkedGalleries: campaign.galleries.map(
        (item): DashboardCampaignLinkedGallery => ({
          id: item.id,
          title: item.title,
          createdAt: item.createdAt.toISOString(),
          imageCount: item.images.length,
          coverImage: item.images.sort((a, b) => a.order - b.order)[0]?.url ?? null,
        }),
      ),
    };
  });

  const galleryOptions: DashboardCampaignGalleryOption[] = galleriesRaw.map((item) => ({
    id: item.id,
    title: item.title,
    createdAt: item.createdAt.toISOString(),
    imageCount: item.images.length,
    coverImage: item.images.sort((a, b) => a.order - b.order)[0]?.url ?? null,
  }));

  const donations: DashboardDonationItem[] = donationsRaw.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    donorName: item.isAnonymous ? "Hamba Allah" : item.donorName,
    donorEmail: item.donorEmail,
    donorPhone: item.donorPhone,
    amount: item.amount,
    message: item.message,
    isAnonymous: item.isAnonymous,
    paymentType: item.paymentType,
    bankName: item.bankName,
    bankAccount: item.bankAccount,
    bankHolder: item.bankHolder,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    campaignId: item.campaign?.id ?? null,
    campaignTitle: item.campaign?.title ?? null,
  }));

  return <DashboardDonationManagement mode="campaigns" initialCampaigns={campaigns} initialDonations={donations} galleryOptions={galleryOptions} />;
}
