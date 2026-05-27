import { DashboardHomepageForm } from "@/components/dashboard/masjid/dashboard-homepage-form";
import dbQuery from "@/lib/data/db-query";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";

export const dynamic = "force-dynamic";

export default async function DashboardHomepagePage() {
  const [profile, campaigns] = await Promise.all([
    getMasjidProfileData(),
    dbQuery.donationCampaign.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <DashboardHomepageForm initialData={profile} campaigns={campaigns} />;
}
