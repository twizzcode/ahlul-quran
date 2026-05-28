"use client";

import type { ReactNode } from "react";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { AppSidebar } from "@/components/dashboard/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// ============================================================
// Dashboard Shell (Client Component)
// Wraps DashboardProvider (auth) + SidebarProvider (UI)
// Renders the sidebar, header, and page content area.
// ============================================================

export function DashboardShell({
  defaultOpen,
  initialUser,
  children,
}: {
  defaultOpen: boolean;
  initialUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
  children: ReactNode;
}) {
  return (
    <DashboardProvider initialUser={initialUser}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="admin-theme bg-[#f6f8f6]"
      >
        <AppSidebar />
        <SidebarInset className="bg-[#f6f8f6]">
          <main className="flex-1 px-4 pb-4 pt-0 md:px-6 md:pb-6 md:pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
