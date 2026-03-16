import type { Metadata } from "next";
import { HomeLayoutShell } from "@/components/home-layout-shell";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";

export const metadata: Metadata = {
  title: {
    default: "Masjid Ahlul Qur'an - Website Resmi",
    template: "%s | Masjid Ahlul Qur'an",
  },
  description:
    "Website resmi Masjid Ahlul Qur'an - profil markas dakwah, kegiatan, donasi, dan gerakan umat.",
};

export const dynamic = "force-dynamic";

// ============================================================
// Public Site Layout (masjidcontoh.com)
// ============================================================

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMasjidProfileData();

  return <HomeLayoutShell profile={profile}>{children}</HomeLayoutShell>;
}
