import { notFound } from "next/navigation";
import { asc, desc, eq, isNull, or } from "drizzle-orm";
import { DashboardCampaignDetail } from "@/components/dashboard/donations/dashboard-campaign-detail";
import { type DashboardCampaignGalleryOption, type DashboardCampaignItem, type DashboardCampaignLinkedArticle, type DashboardCampaignLinkedGallery, type DashboardDonationItem } from "@/components/dashboard/donations/dashboard-donation-management";
import { db } from "@/src";
import { article, donation, gallery } from "@/src/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardKampanyeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [campaignRaw, donationsRaw, galleriesRaw] = await Promise.all([
    db.query.donationCampaign.findFirst({
      where: (table, { eq: eqFn }) => or(eqFn(table.id, id), eqFn(table.slug, id)),
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
          with: { images: true },
          orderBy: (table, { asc: orderAsc }) => [orderAsc(table.createdAt)],
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
    db.query.gallery.findMany({
      where: or(isNull(gallery.donationCampaignId), eq(gallery.donationCampaignId, id)),
      with: { images: true },
      orderBy: [asc(gallery.createdAt)],
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
    linkedGalleries: campaignRaw.galleries.map(
      (item): DashboardCampaignLinkedGallery => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt.toISOString(),
        imageCount: item.images.length,
        coverImage: item.images.sort((a, b) => a.order - b.order)[0]?.url ?? null,
      }),
    ),
  };

  const donations: DashboardDonationItem[] = relevantDonations.map((item) => ({
    id: item.id,
    orderId: item.orderId,
    donorName: item.isAnonymous ? "Hamba Allah" : item.donorName,
    donorEmail: item.donorEmail,
    donorPhone: item.donorPhone,
    amount: item.amount,
    message: item.message,
    isAnonymous: item.isAnonymous,
    paymentType: item.paymentType,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    campaignId: item.campaignId,
    campaignTitle: campaignRaw.title,
  }));

  const galleryOptions: DashboardCampaignGalleryOption[] = galleriesRaw.map((item) => ({
    id: item.id,
    title: item.title,
    createdAt: item.createdAt.toISOString(),
    imageCount: item.images.length,
    coverImage: item.images.sort((a, b) => a.order - b.order)[0]?.url ?? null,
  }));

  return <DashboardCampaignDetail campaign={campaign} donations={donations} galleryOptions={galleryOptions} />;
}
