"use client";

import type { ReactNode } from "react";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { AppSidebar } from "@/components/dashboard/navigation/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { getAdminAliasPath, getAdminPageTitle } from "@/lib/routing/admin-routes";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const aliasPath = getAdminAliasPath(pathname) ?? pathname;
  const pageTitle = getAdminPageTitle(aliasPath);

  return (
    <DashboardProvider initialUser={initialUser}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="admin-theme bg-[#f6f8f6]"
      >
        <AppSidebar />
        <SidebarInset className="bg-[#f6f8f6]">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-emerald-950/8 bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-lg text-emerald-950 hover:bg-emerald-50" />
                <Separator
                  orientation="vertical"
                  className="mr-2 hidden bg-emerald-900/10 data-[orientation=vertical]:h-5 sm:block"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-emerald-700">
                    Admin Panel
                  </p>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="truncate text-base font-semibold text-emerald-950">
                          {pageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 md:inline-flex">
                <span>Shortcut</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                  Ctrl/Cmd + B
                </span>
                <span>untuk sidebar</span>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 pb-4 pt-0 md:px-6 md:pb-6 md:pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
