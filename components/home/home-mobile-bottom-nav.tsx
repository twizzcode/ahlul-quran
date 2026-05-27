"use client";

import type { SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function NewsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v13.5A4.5 4.5 0 0 1 14.5 21H7a4 4 0 0 1-4-4V7.5A2.5 2.5 0 0 1 5.5 5" />
      <path d="M7 8h8" />
      <path d="M7 11.5h8" />
      <path d="M7 15h5" />
    </svg>
  );
}

function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20.5s-7-4.4-7-10.2A4.3 4.3 0 0 1 9.3 6c1.2 0 2.2.5 2.7 1.4.5-.9 1.5-1.4 2.7-1.4A4.3 4.3 0 0 1 19 10.3c0 5.8-7 10.2-7 10.2Z" />
    </svg>
  );
}

function GalleryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.3" />
      <path d="m21 15-4.2-4.2a1.5 1.5 0 0 0-2.1 0L9 16.5" />
      <path d="m12 14 1.4-1.4a1.5 1.5 0 0 1 2.1 0L19 16" />
    </svg>
  );
}

function ProfileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 4.5 5 8v4.8c0 4.1 2.8 7.9 7 8.7 4.2-.8 7-4.6 7-8.7V8l-7-3.5Z" />
      <path d="M9.2 15.5c.7-1.5 2-2.3 2.8-2.3s2.1.8 2.8 2.3" />
      <circle cx="12" cy="10" r="1.8" />
    </svg>
  );
}

const navIcons = {
  home: HomeIcon,
  berita: NewsIcon,
  donasi: HeartIcon,
  galeri: GalleryIcon,
  profil: ProfileIcon,
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

export function HomeMobileBottomNav() {
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
      </div>
    </nav>
  );
}
