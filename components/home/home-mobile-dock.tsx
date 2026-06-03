"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, Images, Newspaper, type LucideIcon } from "lucide-react";

import { AccountMenu } from "@/components/home/account-menu";
import { cn } from "@/lib/utils";

const navIcons: Record<string, LucideIcon> = {
  home: House,
  berita: Newspaper,
  donasi: Heart,
  galeri: Images,
};

const navItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Berita", href: "/berita", icon: "berita" },
  { label: "Donasi", href: "/donasi", icon: "donasi" },
  { label: "Galeri", href: "/galeri", icon: "galeri" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/berita") {
    return (
      pathname === "/berita" ||
      pathname.startsWith("/berita/") ||
      pathname === "/artikel" ||
      pathname.startsWith("/artikel/")
    );
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type HomeMobileDockProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    canOpenAdmin?: boolean;
    adminUrl?: string | null;
  } | null;
};

export function HomeMobileDock({ user }: HomeMobileDockProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[120] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.4rem] border border-emerald-100/80 bg-white/96 p-2 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur">
        {navItems.map((item) => {
          const Icon = navIcons[item.icon];
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-15 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium text-emerald-900/72 transition-all duration-200",
                active
                  ? "bg-emerald-900 text-white shadow-[0_10px_24px_rgba(6,95,70,0.24)]"
                  : "hover:bg-emerald-50 hover:text-emerald-950",
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <AccountMenu
          user={user}
          canOpenAdmin={Boolean(user?.canOpenAdmin)}
          adminUrl={user?.adminUrl}
          mobile
        />
      </div>
    </nav>
  );
}
