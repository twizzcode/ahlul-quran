"use client";

import type { ReactNode } from "react";
import { DashboardProvider } from "@/components/dashboard-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { getAdminPageTitle } from "@/lib/admin-routes";
import { usePathname } from "next/navigation";

// ============================================================
// Dashboard Shell (Client Component)
// Wraps DashboardProvider (auth) + SidebarProvider (UI)
// Renders the sidebar, header, and page content area.
// ============================================================

export function DashboardShell({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <DashboardProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset className="bg-[#fafaf7]">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-slate-200/80 bg-[#fafaf7]/92 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-xl hover:bg-slate-100" />
                <Separator
                  orientation="vertical"
                  className="mr-2 hidden data-[orientation=vertical]:h-5 sm:block"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Admin Panel
                  </p>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="truncate text-base font-semibold text-slate-950">
                          {pageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm md:inline-flex">
                <span>Gunakan</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                  Ctrl/Cmd + B
                </span>
                <span>untuk membuka sidebar</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
