"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageContentMotion } from "@/components/shared/page-content-motion";
import { SiteFooter } from "@/components/home/site-footer";
import { HomeMobileDock } from "@/components/home/home-mobile-dock";
import { HomeNavbar } from "@/components/home/home-navbar";
import type { MasjidProfileData } from "@/lib/masjid/masjid-profile";

type HomeLayoutShellProps = {
  children: ReactNode;
  profile: MasjidProfileData;
  user: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
  featuredNews: {
    title: string;
    href: string;
    image: string | null;
    excerpt: string;
    publishedAtLabel: string;
  } | null;
};

export function HomeLayoutShell({ children, profile, user, featuredNews }: HomeLayoutShellProps) {
  const pathname = usePathname();
  const normalizedPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const hideChrome = normalizedPath === "/login";
  const hideMobileDock = hideChrome || /^\/donasi\/[^/]+$/.test(normalizedPath);

  return (
    <div className="flex min-h-screen flex-col lg:pb-0">
      {!hideChrome && <HomeNavbar profile={profile} initialUser={user} featuredNews={featuredNews} />}
      <main className="flex-1">
        <PageContentMotion>{children}</PageContentMotion>
      </main>
      {!hideChrome && <SiteFooter profile={profile} />}
      {!hideMobileDock && <HomeMobileDock />}
    </div>
  );
}
