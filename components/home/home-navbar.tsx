"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpenText, ChevronDown, HandHeart, LogIn, Newspaper } from "lucide-react";
import {
  MobileNav,
  MobileNavHeader,
  NavBody,
  Navbar,
} from "@/components/ui/resizable-navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/auth-client";
import type { MasjidProfileData } from "@/lib/masjid/masjid-profile";

const navItems = [
  { name: "Program", link: "/kegiatan" },
  { name: "Donasi", link: "/donasi" },
  { name: "Galeri", link: "/galeri" },
];

const newsItems = [
  {
    name: "Berita",
    link: "/berita",
    description: "Kabar terbaru, pengumuman, dan update gerakan masjid.",
    icon: Newspaper,
  },
  {
    name: "Artikel",
    link: "/artikel",
    description: "Kajian, khutbah, dan materi pembinaan yang lebih mendalam.",
    icon: BookOpenText,
  },
];

const profileItems = [
  {
    name: "Latar Belakang",
    link: "/profil#latar-belakang",
    description: "Alasan pendirian dan kebutuhan umat yang ingin dijawab.",
  },
  {
    name: "Visi Utama",
    link: "/profil#visi-utama",
    description: "Arah utama pembangunan markas dakwah.",
  },
  {
    name: "Pilar Gerakan",
    link: "/profil#pilar-gerakan",
    description: "Empat fungsi utama: ibadah, dakwah, tumbuh, dan inklusif.",
  },
  {
    name: "Tahapan Pendirian",
    link: "/profil#tahapan-pendirian",
    description: "Proses legal, teknis, dan operasional pembangunan.",
  },
  {
    name: "Struktur Panitia",
    link: "/profil#struktur-panitia",
    description: "Susunan tim dan tupoksi teknis pembangunan.",
  },
  {
    name: "Sumber Dana",
    link: "/profil#sumber-dana",
    description: "Skema penggalangan dan pengelolaan dana gerakan.",
  },
];

function Brand({ profile }: { profile: MasjidProfileData }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden text-emerald-900 transition-colors">
        <Image
          src={profile.logoUrl || "/logo.webp"}
          alt={`${profile.name} logo`}
          width={20}
          height={20}
          className="h-9 w-9 object-contain"
        />
      </div>
      <div className="min-w-0">
        <span className="block truncate text-sm font-bold leading-tight text-emerald-900 transition-colors sm:text-base">
          {profile.name}
        </span>
        <span className="hidden truncate text-[11px] uppercase tracking-[0.18em] text-emerald-700/80 lg:block">
          {profile.movementName}
        </span>
      </div>
    </Link>
  );
}

type NavbarUser = {
  name: string;
  email: string;
  image?: string | null;
};

type FeaturedNews = {
  title: string;
  href: string;
  image: string | null;
  excerpt: string;
  publishedAtLabel: string;
};

export function HomeNavbar({
  profile,
  initialUser,
  featuredNews,
}: {
  profile: MasjidProfileData;
  initialUser: NavbarUser | null;
  featuredNews: FeaturedNews | null;
}) {
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false);
  const [isProfileMegaOpen, setIsProfileMegaOpen] = useState(false);
  const pathname = usePathname();
  const isAccountActive = pathname === "/akun" || pathname.startsWith("/akun/");
  const accountHref = user ? "/akun" : "/login";
  const userInitial =
    user?.name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.trim()?.[0]?.toUpperCase() ??
    "A";

  const centerNavItemClassName =
    "relative h-auto rounded-full px-4 py-2.5 text-sm font-medium text-emerald-900/72 shadow-none transition-all duration-200 hover:text-emerald-950";

  return (
    <>
      <Navbar className="fixed inset-x-0 top-0 z-[100]">
        <NavBody className="group/home-nav min-h-[var(--home-nav-height)] min-w-0 max-w-7xl bg-white px-4 text-emerald-900 shadow-none backdrop-blur md:px-0 data-[scrolled=true]:bg-white">
          <Brand profile={profile} />
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsNewsMenuOpen(true)}
              onMouseLeave={() => setIsNewsMenuOpen(false)}
            >
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  centerNavItemClassName,
                  isNewsMenuOpen && "bg-emerald-50 text-emerald-950",
                )}
              >
                Berita
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isNewsMenuOpen && "rotate-180",
                  )}
                />
              </Button>

              <div
                className={cn(
                  "absolute left-1/2 top-full z-[120] w-[760px] -translate-x-1/2 pt-7 transition-all duration-200",
                  isNewsMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0",
                )}
              >
                <div className="grid grid-cols-[250px_1fr] gap-4 rounded-[28px] border border-emerald-100/80 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  <Link
                    href={featuredNews?.href ?? "/berita"}
                    className="group rounded-xl p-3 transition-colors hover:bg-emerald-50/60"
                  >
                    <div className="relative h-40 overflow-hidden rounded-lg">
                      <Image
                        src={featuredNews?.image || "/Gambar-masjid.png"}
                        alt={featuredNews?.title ?? "Berita utama"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-xs uppercase tracking-wide text-white/80">
                          Berita Utama
                        </p>
                        <p className="line-clamp-2 text-sm font-semibold">
                          {featuredNews?.title ?? "Ikuti kabar terbaru dan pengumuman gerakan masjid"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700/80">
                      {featuredNews?.publishedAtLabel ?? "Update Terbaru"}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-black/70">
                      {featuredNews?.excerpt ??
                        "Rangkuman berita paling baru, pengumuman penting, dan perkembangan terbaru gerakan Masjid Ahlul Qur'an."}
                    </p>
                  </Link>

                  <div className="divide-y divide-emerald-100/80">
                    {newsItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.link}
                          href={item.link}
                          className="group mx-1 flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:translate-x-0.5 hover:bg-emerald-100/80"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-900 group-hover:text-white">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-black transition-colors group-hover:text-emerald-950">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-black/70 transition-colors group-hover:text-black/85">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={centerNavItemClassName}
              >
                {item.name}
              </Link>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setIsProfileMegaOpen(true)}
              onMouseLeave={() => setIsProfileMegaOpen(false)}
            >
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  centerNavItemClassName,
                  isProfileMegaOpen && "bg-emerald-50 text-emerald-950",
                )}
              >
                Profil
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isProfileMegaOpen && "rotate-180",
                  )}
                />
              </Button>

              <div
                className={cn(
                  "absolute left-1/2 top-full z-[120] w-[760px] -translate-x-1/2 pt-7 transition-all duration-200",
                  isProfileMegaOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0",
                )}
              >
                <div className="grid grid-cols-[250px_1fr] gap-4 rounded-[28px] border border-emerald-100/80 bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  <Link
                    href="/profil"
                    className="group rounded-xl p-3 transition-colors hover:bg-emerald-50/60"
                  >
                    <div className="relative h-40 overflow-hidden rounded-lg">
                      <Image
                        src="/Gambar-masjid.png"
                        alt="Profil Masjid"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-xs uppercase tracking-wide text-white/80">
                          {profile.movementName}
                        </p>
                        <p className="text-sm font-semibold">
                          Kenali Arah Gerak Markas Dakwah
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-black/70">
                      Profil lengkap pembangunan, visi, struktur panitia, dan tahapan
                      gerakan {profile.name}.
                    </p>
                  </Link>

                  <div className="divide-y divide-emerald-100/80">
                    {profileItems.map((item, index) => (
                      <Link
                        key={item.link}
                        href={item.link}
                        className="group mx-1 flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:translate-x-0.5 hover:bg-emerald-100/80"
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-900 group-hover:text-white">
                          {(index + 1).toString().padStart(2, "0")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black transition-colors group-hover:text-emerald-950">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-black/70 transition-colors group-hover:text-black/85">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:text-white hover:shadow-[0_12px_30px_rgba(6,95,70,0.24)]"
            >
              <Link href="/donasi">
                <HandHeart className="h-4 w-4" />
                Infaq Sekarang
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "rounded-full shadow-none transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-950",
                user ? "h-10 w-10 overflow-hidden p-0" : "h-10 w-10 p-0",
                isAccountActive ? "bg-emerald-50 text-emerald-950" : "text-emerald-900/85",
              )}
            >
              <Link href={accountHref} aria-label={user ? "Buka akun" : "Login"}>
                {user ? (
                  user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Akun"}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900">
                      {userInitial}
                    </span>
                  )
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
              </Link>
            </Button>
          </div>
        </NavBody>

        <MobileNav className="group/home-nav fixed inset-x-0 top-0 z-[110] min-h-[var(--home-nav-height)] max-w-none rounded-none bg-white/95 px-4 text-emerald-900 shadow-sm backdrop-blur data-[scrolled=true]:bg-white">
          <MobileNavHeader>
            <Brand profile={profile} />
          </MobileNavHeader>
        </MobileNav>
      </Navbar>
    </>
  );
}
