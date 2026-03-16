import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { DonationPageClient, type DonationCampaignView, type DonationItemView } from "@/components/donation-page-client";
import type { DonorHighlightItem } from "@/components/animated-tooltip-demo";

export const metadata: Metadata = {
  title: "Donasi",
  description: "Berdonasi untuk kemajuan masjid - Infaq, Sedekah, Zakat, Wakaf",
};

export const dynamic = "force-dynamic";

export default async function DonasiPage() {

  const [campaignsRaw, recentDonationsRaw, donorHighlightsRaw] = await Promise.all([
    prisma.donationCampaign.findMany({
      where: { isActive: true },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: {
            amount: true,
            donorName: true,
            isAnonymous: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.donation.findMany({
      where: { status: "SUCCESS" },
      include: {
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.donation.findMany({
      where: { status: "SUCCESS" },
      select: {
        id: true,
        donorName: true,
        isAnonymous: true,
        amount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
  ]);

  const campaigns: DonationCampaignView[] = campaignsRaw.map((campaign) => {
    const collectedAmount = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
    const progress =
      campaign.targetAmount > 0
        ? Math.min(100, Math.round((collectedAmount / campaign.targetAmount) * 100))
        : 0;

    return {
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      coverImage: campaign.coverImage,
      targetAmount: campaign.targetAmount,
      collectedAmount,
      progress,
      endDate: campaign.endDate ? campaign.endDate.toISOString() : null,
      supporters: Array.from(
        campaign.donations.reduce((acc, donation) => {
          const name = donation.isAnonymous ? "Hamba Allah" : donation.donorName;
          const current = acc.get(name) ?? 0;
          acc.set(name, current + donation.amount);
          return acc;
        }, new Map<string, number>())
      )
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount]) => ({
          name,
          amount,
        })),
    };
  });

  const recentDonations: DonationItemView[] = recentDonationsRaw.map((donation) => ({
    id: donation.id,
    donorName: donation.isAnonymous ? "Hamba Allah" : donation.donorName,
    amount: donation.amount,
    type: donation.type,
    createdAt: donation.createdAt.toISOString(),
    campaignTitle: donation.campaign?.title ?? null,
  }));

  const donorAggregate = new Map<
    string,
    { totalAmount: number; donationCount: number }
  >();

  for (const donation of donorHighlightsRaw) {
    const displayName = donation.isAnonymous ? "Hamba Allah" : donation.donorName;
    const current = donorAggregate.get(displayName) ?? {
      totalAmount: 0,
      donationCount: 0,
    };

    current.totalAmount += donation.amount;
    current.donationCount += 1;
    donorAggregate.set(displayName, current);
  }

  const donorHighlights: DonorHighlightItem[] = Array.from(donorAggregate.entries())
    .map(([name, aggregate], index) => ({
      id: index + 1,
      name,
      totalAmount: aggregate.totalAmount,
      donationCount: aggregate.donationCount,
    }))
    .sort((a, b) => {
      if (b.totalAmount !== a.totalAmount) {
        return b.totalAmount - a.totalAmount;
      }

      return b.donationCount - a.donationCount;
    })
    .slice(0, 8);

  return (
    <DonationPageClient
      campaigns={campaigns}
      recentDonations={recentDonations}
      donorHighlights={donorHighlights}
    />
  );
}
