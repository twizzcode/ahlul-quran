import { DashboardMasjidProfileForm } from "@/components/dashboard-masjid-profile-form";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";

export const dynamic = "force-dynamic";

export default async function DashboardProfilMasjidPage() {
  const profile = await getMasjidProfileData();

  return <DashboardMasjidProfileForm initialData={profile} />;
}

