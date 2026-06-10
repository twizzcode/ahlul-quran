import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth/auth";
import { buildOrigin, getPublicHost, isAdminRole } from "@/lib/routing/domain-routing";
import { db } from "@/src";
import { user } from "@/src/db/schema";

export const metadata: Metadata = {
  title: {
    default: "Dashboard Admin",
    template: "%s | Dashboard Masjid",
  },
  description: "Panel admin untuk mengelola website masjid",
  robots: {
    index: false,
    follow: false,
  },
};

async function getPublicOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return buildOrigin(protocol, getPublicHost(host));
}

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

  if (!session?.user) {
    redirect(`${publicOrigin}/login?next=/admin`);
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  const role = dbUser?.role;

  if (!isAdminRole(role)) {
    redirect(publicOrigin);
  }

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <DashboardShell
      defaultOpen={defaultOpen}
      initialUser={{
        id: dbUser?.id ?? session.user.id,
        name: dbUser?.name ?? session.user.name,
        email: dbUser?.email ?? session.user.email,
        image: dbUser?.image ?? session.user.image,
        role: dbUser?.role ?? "JAMAAH",
      }}
    >
      {children}
    </DashboardShell>
  );
}
