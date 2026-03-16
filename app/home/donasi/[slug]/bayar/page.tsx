import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DonationCheckoutForm } from "@/components/donation-checkout-form";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";
import { getManualBankTransferDetails } from "@/lib/manual-bank-transfer";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await prisma.donationCampaign.findUnique({
    where: { slug },
    select: { title: true },
  });

  return {
    title: campaign ? `Bayar Donasi - ${campaign.title}` : "Bayar Donasi",
  };
}

export default async function DonationCampaignCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign, profile] = await Promise.all([
    prisma.donationCampaign.findUnique({
      where: { slug },
      include: {
        donations: {
          where: { status: "SUCCESS" },
          select: {
            amount: true,
            donorName: true,
            isAnonymous: true,
          },
          orderBy: { amount: "desc" },
        },
      },
    }),
    getMasjidProfileData(),
  ]);

  if (!campaign) {
    notFound();
  }

  const collectedAmount = campaign.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const progress =
    campaign.targetAmount > 0
      ? Math.min(100, Math.round((collectedAmount / campaign.targetAmount) * 100))
      : 0;
  const manualTransfer = getManualBankTransferDetails(profile);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/donasi" className="hover:text-slate-800">
          Donasi
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/donasi/${campaign.slug}`} className="hover:text-slate-800">
          Detail Campaign
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900">Pembayaran</span>
      </div>

      <DonationCheckoutForm
        campaign={{
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
          bankName: manualTransfer.bankName,
          bankAccount: manualTransfer.bankAccount,
          bankHolder: manualTransfer.bankHolder,
        }}
      />
    </div>
  );
}
