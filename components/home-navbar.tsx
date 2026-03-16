"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpenText, ChevronDown, Newspaper, Phone } from "lucide-react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
} from "@/components/ui/resizable-navbar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { MasjidProfileData } from "@/lib/masjid-profile";

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
  {
    name: "Roadmap",
    link: "/profil#roadmap-markas",
    description: "Tahap implementasi markas dakwah lintas tahun.",
  },
];

function Brand({ profile }: { profile: MasjidProfileData }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
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

function getContactHref(profile: MasjidProfileData) {
  if (profile.email) {
    return `mailto:${profile.email}`;
  }

  if (profile.phone) {
    return `tel:${profile.phone}`;
  }

  return "/profil";
}

export function HomeNavbar({ profile }: { profile: MasjidProfileData }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNewsOpen, setIsMobileNewsOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false);
  const [isProfileMegaOpen, setIsProfileMegaOpen] = useState(false);
  const pathname = usePathname();
  const isNewsActive =
    pathname === "/berita" ||
    pathname.startsWith("/berita/") ||
    pathname === "/artikel" ||
    pathname.startsWith("/artikel/");
  const isProfileActive = pathname === "/profil" || pathname.startsWith("/profil/");
  const contactHref = getContactHref(profile);

  function isActive(link: string) {
    if (link === "/") {
      return pathname === "/";
    }

    return pathname === link || pathname.startsWith(`${link}/`);
  }

  return (
    <>
      <Navbar className="fixed inset-x-0 top-0 z-[100]">
        <NavBody className="group/home-nav min-h-[var(--home-nav-height)] min-w-0 max-w-7xl bg-white px-4 text-emerald-900 shadow-none backdrop-blur md:px-0 data-[scrolled=true]:bg-white">
          <Brand profile={profile} />
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsNewsMenuOpen(true)}
              onMouseLeave={() => setIsNewsMenuOpen(false)}
            >
              <button
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-all duration-200",
                  isNewsActive || isNewsMenuOpen
                    ? "bg-emerald-50 font-semibold text-emerald-900"
                    : "text-emerald-900/85 hover:bg-emerald-50 hover:text-emerald-900",
                )}
              >
                Berita
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isNewsMenuOpen && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute left-1/2 top-full z-[120] w-[360px] -translate-x-1/2 pt-3 transition-all duration-200",
                  isNewsMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0",
                )}
              >
                <div className="rounded-2xl bg-white/95 p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  <div className="divide-y divide-emerald-100/80">
                    {newsItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.link}
                          href={item.link}
                          className="group -mx-1 flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-emerald-100/80"
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
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-all duration-200",
                  isActive(item.link)
                    ? "bg-emerald-50 text-emerald-900 font-semibold"
                    : "text-emerald-900/85 hover:bg-emerald-50 hover:text-emerald-900",
                )}
              >
                {item.name}
              </Link>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setIsProfileMegaOpen(true)}
              onMouseLeave={() => setIsProfileMegaOpen(false)}
            >
              <button
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-all duration-200",
                  isProfileActive || isProfileMegaOpen
                    ? "bg-emerald-50 text-emerald-900 font-semibold"
                    : "text-emerald-900/85 hover:bg-emerald-50 hover:text-emerald-900",
                )}
              >
                Profil
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isProfileMegaOpen && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute left-1/2 top-full z-[120] w-[760px] -translate-x-1/2 pt-3 transition-all duration-200",
                  isProfileMegaOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0",
                )}
              >
                <div className="grid grid-cols-[250px_1fr] gap-4 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm">
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
                      Profil lengkap pembangunan, visi, struktur panitia, dan roadmap
                      gerakan {profile.name}.
                    </p>
                  </Link>

                  <div className="divide-y divide-emerald-100/80">
                    {profileItems.map((item, index) => (
                      <Link
                        key={item.link}
                        href={item.link}
                        className="group -mx-1 flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-emerald-100/80"
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
            <Link
              href={contactHref}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-950"
            >
              <Phone className="h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </NavBody>

        <MobileNav className="group/home-nav fixed inset-x-0 top-0 z-[110] min-h-[var(--home-nav-height)] max-w-none rounded-none bg-white/95 px-4 text-emerald-900 shadow-sm backdrop-blur data-[scrolled=true]:bg-white">
          <MobileNavHeader>
            <Brand profile={profile} />
            {/* <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            /> */}
          </MobileNavHeader>

          {/* <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <Collapsible
              open={isMobileNewsOpen}
              onOpenChange={setIsMobileNewsOpen}
              className="w-full"
            >
              <CollapsibleTrigger
                className={cn(
                  "relative flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200",
                  isNewsActive
                    ? "bg-emerald-50 font-semibold text-emerald-900"
                    : "text-emerald-900/85 hover:bg-emerald-50 hover:text-emerald-900",
                )}
              >
                <span>Berita</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isMobileNewsOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-xl bg-emerald-50/40 p-2">
                <div className="divide-y divide-emerald-200/70">
                  {newsItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.link}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMobileNewsOpen(false);
                        }}
                        href={item.link}
                        className="group flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-emerald-900/85 transition-all duration-200 hover:bg-emerald-100/80 hover:text-emerald-900"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-900 group-hover:text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium transition-colors group-hover:text-emerald-950">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-emerald-900/60 transition-colors group-hover:text-emerald-900/80">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {navItems.map((item) => (
              <Link
                key={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                href={item.link}
                className={cn(
                  "relative block w-full rounded-md px-3 py-2 text-sm transition-all duration-200",
                  isActive(item.link)
                    ? "bg-emerald-50 text-emerald-900 font-semibold"
                    : "text-emerald-900/85 hover:bg-emerald-50 hover:text-emerald-900",
                )}
              >
                {item.name}
              </Link>
            ))}
            <Collapsible
              open={isMobileProfileOpen}
              onOpenChange={setIsMobileProfileOpen}
              className="w-full"
            >
              <CollapsibleTrigger
                className={cn(
                  "relative flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200",
                  isProfileActive
                    ? "bg-emerald-50 text-emerald-900 font-semibold"
                    : "text-emerald-900/85 hover:bg-emerald-50 hover:text-emerald-900",
                )}
              >
                <span>Profil</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isMobileProfileOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-xl bg-emerald-50/40 p-2">
                <div className="divide-y divide-emerald-200/70">
                  {profileItems.map((item, index) => (
                    <Link
                      key={item.link}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMobileProfileOpen(false);
                      }}
                      href={item.link}
                      className="group flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-emerald-900/85 transition-all duration-200 hover:bg-emerald-100/80 hover:text-emerald-900"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-800 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-900 group-hover:text-white">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium transition-colors group-hover:text-emerald-950">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-emerald-900/60 transition-colors group-hover:text-emerald-900/80">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex w-full flex-col gap-3 pt-2">
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href={contactHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-950"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </MobileNavMenu> */}
        </MobileNav>
      </Navbar>
    </>
  );
}
