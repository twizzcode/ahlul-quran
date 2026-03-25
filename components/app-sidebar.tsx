"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  ExternalLink,
  Flag,
  Heart,
  Home,
  Image as ImageIcon,
  Landmark,
  Users,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ADMIN_NAV_ITEMS } from "@/lib/admin-routes"

const iconMap = {
  Dashboard: Home,
  Artikel: BookOpen,
  Donasi: Heart,
  Kampanye: Flag,
  Galeri: ImageIcon,
  Profile: Landmark,
  Pengguna: Users,
} as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  function isActive(url: string) {
    if (url === "/") return pathname === "/"
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Landmark className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Masjid</span>
                  <span className="truncate text-xs">Panel Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Menu Utama
          </SidebarGroupLabel>
          <SidebarMenu>
            {ADMIN_NAV_ITEMS.main.map((item) => {
              const Icon = iconMap[item.title]

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    className="rounded-xl px-3 py-2.5 data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-950 hover:bg-emerald-50 hover:text-emerald-950"
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Pengaturan
          </SidebarGroupLabel>
          <SidebarMenu>
            {ADMIN_NAV_ITEMS.settings.map((item) => {
              const Icon = iconMap[item.title]

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    className="rounded-xl px-3 py-2.5 data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-950 hover:bg-emerald-50 hover:text-emerald-950"
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* External Link */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Lihat Website"
                className="rounded-xl border border-dashed border-emerald-200 px-3 py-2.5 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50"
              >
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink />
                  <span>Lihat Website</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
