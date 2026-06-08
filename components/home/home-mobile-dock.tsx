"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, Images, Newspaper, type LucideIcon } from "lucide-react";
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
  { label: "Profil", href: "/profil", icon: "profil" },
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

export function HomeMobileDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[120] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.4rem] border border-emerald-100/80 bg-white/96 p-2 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon === "profil" ? null : navIcons[item.icon];

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
              {item.icon === "profil" ? (
                <span className="mb-1 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="/logo.webp"
                    alt="Profil"
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                </span>
              ) : (
                Icon ? <Icon className="mb-1 h-4 w-4" /> : null
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
