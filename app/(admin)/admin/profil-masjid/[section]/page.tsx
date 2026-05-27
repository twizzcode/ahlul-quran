import { notFound } from "next/navigation";
import { DashboardMasjidProfileForm } from "@/components/dashboard/masjid/dashboard-masjid-profile-form";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";

export const dynamic = "force-dynamic";

const SECTION_MAP = {
  "tahapan-pendirian": "timeline",
  "struktur-panitia": "committee",
  "sosial-media": "social",
  "rekening-donasi": "bank",
} as const;

export default async function DashboardProfilMasjidSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const profileSection = SECTION_MAP[section as keyof typeof SECTION_MAP];

  if (!profileSection) {
    notFound();
  }

  const profile = await getMasjidProfileData();

  return (
    <div className="pt-4 md:pt-6">
      <DashboardMasjidProfileForm initialData={profile} section={profileSection} />
    </div>
  );
}
