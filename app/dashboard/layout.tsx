import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { buildOrigin, getPublicHost, isAdminRole } from "@/lib/domain-routing";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Dashboard Admin",
    template: "%s | Dashboard Masjid",
  },
  description: "Panel admin untuk mengelola website masjid",
};

// ============================================================
// Dashboard Layout
// Server component that reads the sidebar cookie state,
// then renders the client shell with SidebarProvider + DashboardProvider.
async function getPublicOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return buildOrigin(protocol, getPublicHost(host));
}

// Auth check: proxy.ts handles host separation + session presence.
//             Layout finalizes session validity + role on the server.
// ============================================================

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const publicOrigin = await getPublicOrigin();
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(headerStore),
  });

  if (!session?.user || !isAdminRole(session.user.role)) {
    redirect(`${publicOrigin}/`);
  }

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>;
}
