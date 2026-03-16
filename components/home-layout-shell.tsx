"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageContentMotion } from "@/components/page-content-motion";
import { SiteFooter } from "@/components/site-footer";
import { HomeMobileDock } from "@/components/home-mobile-dock";
import { HomeNavbar } from "@/components/home-navbar";
import type { MasjidProfileData } from "@/lib/masjid-profile";

type HomeLayoutShellProps = {
  children: ReactNode;
  profile: MasjidProfileData;
};

export function HomeLayoutShell({ children, profile }: HomeLayoutShellProps) {
  const pathname = usePathname();
  const normalizedPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const hideChrome = normalizedPath === "/login";
  const hideMobileDock = hideChrome || /^\/donasi\/[^/]+$/.test(normalizedPath);

  return (
    <div className="flex min-h-screen flex-col lg:pb-0">
      {!hideChrome && <HomeNavbar profile={profile} />}
      <main className="flex-1">
        <PageContentMotion>{children}</PageContentMotion>
      </main>
      {!hideChrome && <SiteFooter profile={profile} />}
      {!hideMobileDock && <HomeMobileDock />}
    </div>
  );
}
