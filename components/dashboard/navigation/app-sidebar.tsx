"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Flag,
  Heart,
  Home,
  Image as ImageIcon,
  Landmark,
  Monitor,
  Users,
} from "lucide-react"

import { NavUser } from "@/components/dashboard/navigation/nav-user"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ADMIN_NAV_ITEMS, ADMIN_ROUTE_PATHS, getAdminAliasPath } from "@/lib/routing/admin-routes"

const iconMap = {
  Dashboard: Home,
  Artikel: BookOpen,
  Donasi: Heart,
  Kampanye: Flag,
  Galeri: ImageIcon,
  Homepage: Monitor,
  Profile: Landmark,
  Pengguna: Users,
} as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const aliasPath = getAdminAliasPath(pathname) ?? pathname
  const isProfileOpen = aliasPath === ADMIN_ROUTE_PATHS.profile || aliasPath.startsWith(`${ADMIN_ROUTE_PATHS.profile}/`)
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(isProfileOpen)

  const profileSubItems = [
    { title: "Umum", url: ADMIN_ROUTE_PATHS.profile },
    { title: "Tahapan Pendirian", url: ADMIN_ROUTE_PATHS.profileTimeline },
    { title: "Struktur", url: ADMIN_ROUTE_PATHS.profileCommittee },
    { title: "Sosial Media", url: ADMIN_ROUTE_PATHS.profileSocial },
    { title: "Rekening Donasi", url: ADMIN_ROUTE_PATHS.profileBank },
  ] as const

  function isActive(url: string) {
    if (url === "/") return aliasPath === "/"
    return aliasPath === url || aliasPath.startsWith(`${url}/`)
  }

  React.useEffect(() => {
    if (isProfileOpen) {
      setProfileMenuOpen(true)
    }
  }, [isProfileOpen])

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="border-b border-white/10 px-2 pb-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3">
          <div className="flex size-10 items-center justify-center overflow-hidden bg-white ring-1 ring-white/10">
            <Image
              src="/logo.webp"
              alt="Logo Masjid"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white">Admin Masjid</span>
            <span className="truncate text-xs text-emerald-100/72">Panel Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100/60">
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
                    className="rounded-xl px-3 py-2.5 text-emerald-50/85 hover:bg-white/6 hover:text-white data-[active=true]:bg-emerald-500/20 data-[active=true]:text-white"
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
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100/60">
            Pengaturan
          </SidebarGroupLabel>
          <SidebarMenu>
            {ADMIN_NAV_ITEMS.settings.map((item) => {
              const Icon = iconMap[item.title]

              if (item.url === ADMIN_ROUTE_PATHS.profile) {
                return (
                  <Collapsible
                    key={item.url}
                    asChild
                    open={profileMenuOpen}
                    onOpenChange={setProfileMenuOpen}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isProfileOpen}
                          className="rounded-xl px-3 py-2.5 text-emerald-50/85 hover:bg-white/6 hover:text-white data-[active=true]:bg-emerald-500/20 data-[active=true]:text-white"
                        >
                          <Icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {profileSubItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton asChild isActive={aliasPath === subItem.url}>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    className="rounded-xl px-3 py-2.5 text-emerald-50/85 hover:bg-white/6 hover:text-white data-[active=true]:bg-emerald-500/20 data-[active=true]:text-white"
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
                className="rounded-xl border border-white/12 px-3 py-2.5 text-emerald-50 hover:bg-white/6 hover:text-white"
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
