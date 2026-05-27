import { DashboardMasjidProfileForm } from "@/components/dashboard/masjid/dashboard-masjid-profile-form";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";

export const dynamic = "force-dynamic";

export default async function DashboardProfilMasjidPage() {
  const profile = await getMasjidProfileData();
  return (
    <div className="pt-4 md:pt-6">
      <DashboardMasjidProfileForm initialData={profile} />
    </div>
  );
}
