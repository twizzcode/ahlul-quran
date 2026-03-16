export const ADMIN_ROUTE_PATHS = {
  dashboard: "/",
  artikel: "/artikel",
  artikelCreate: "/artikel/tulis",
  donasi: "/donasi",
  kampanye: "/kampanye",
  kampanyeCreate: "/kampanye/tulis",
  galeri: "/galeri",
  profile: "/profile",
  pengguna: "/pengguna",
} as const;

export const ADMIN_NAV_ITEMS = {
  main: [
    { title: "Dashboard", url: ADMIN_ROUTE_PATHS.dashboard },
    { title: "Artikel", url: ADMIN_ROUTE_PATHS.artikel },
    { title: "Donasi", url: ADMIN_ROUTE_PATHS.donasi },
    { title: "Kampanye", url: ADMIN_ROUTE_PATHS.kampanye },
    { title: "Galeri", url: ADMIN_ROUTE_PATHS.galeri },
  ],
  settings: [
    { title: "Profile", url: ADMIN_ROUTE_PATHS.profile },
    { title: "Pengguna", url: ADMIN_ROUTE_PATHS.pengguna },
  ],
} as const;

const INTERNAL_TO_ALIAS: Record<string, string> = {
  "/dashboard": ADMIN_ROUTE_PATHS.dashboard,
  "/dashboard/": ADMIN_ROUTE_PATHS.dashboard,
  "/dashboard/artikel": ADMIN_ROUTE_PATHS.artikel,
  "/dashboard/artikel/tulis": ADMIN_ROUTE_PATHS.artikelCreate,
  "/dashboard/donasi": ADMIN_ROUTE_PATHS.donasi,
  "/dashboard/kampanye": ADMIN_ROUTE_PATHS.kampanye,
  "/dashboard/kampanye/tulis": ADMIN_ROUTE_PATHS.kampanyeCreate,
  "/dashboard/galeri": ADMIN_ROUTE_PATHS.galeri,
  "/dashboard/profil-masjid": ADMIN_ROUTE_PATHS.profile,
  "/dashboard/pengguna": ADMIN_ROUTE_PATHS.pengguna,
  "/profil-masjid": ADMIN_ROUTE_PATHS.profile,
};

const ALIAS_TO_INTERNAL: Record<string, string> = {
  [ADMIN_ROUTE_PATHS.dashboard]: "/dashboard",
  [ADMIN_ROUTE_PATHS.artikel]: "/dashboard/artikel",
  [ADMIN_ROUTE_PATHS.artikelCreate]: "/dashboard/artikel/tulis",
  [ADMIN_ROUTE_PATHS.donasi]: "/dashboard/donasi",
  [ADMIN_ROUTE_PATHS.kampanye]: "/dashboard/kampanye",
  [ADMIN_ROUTE_PATHS.kampanyeCreate]: "/dashboard/kampanye/tulis",
  [ADMIN_ROUTE_PATHS.galeri]: "/dashboard/galeri",
  [ADMIN_ROUTE_PATHS.profile]: "/dashboard/profil-masjid",
  "/profil-masjid": "/dashboard/profil-masjid",
  [ADMIN_ROUTE_PATHS.pengguna]: "/dashboard/pengguna",
};

const PAGE_TITLES: Record<string, string> = {
  [ADMIN_ROUTE_PATHS.dashboard]: "Dashboard",
  [ADMIN_ROUTE_PATHS.artikel]: "Artikel",
  [ADMIN_ROUTE_PATHS.donasi]: "Donasi",
  [ADMIN_ROUTE_PATHS.kampanye]: "Kampanye",
  [ADMIN_ROUTE_PATHS.kampanyeCreate]: "Buat Kampanye",
  [ADMIN_ROUTE_PATHS.galeri]: "Galeri",
  [ADMIN_ROUTE_PATHS.profile]: "Profile",
  "/profil-masjid": "Profile",
  [ADMIN_ROUTE_PATHS.pengguna]: "Pengguna",
};

export function getAdminAliasPath(pathname: string) {
  if (pathname.startsWith("/dashboard/artikel/") && pathname.endsWith("/edit")) {
    return pathname.replace("/dashboard", "");
  }

  if (pathname.startsWith("/dashboard/kampanye/")) {
    return pathname.replace("/dashboard", "");
  }

  return INTERNAL_TO_ALIAS[pathname] ?? null;
}

export function getAdminInternalPath(pathname: string) {
  if (pathname.startsWith("/artikel/") && pathname.endsWith("/edit")) {
    return `/dashboard${pathname}`;
  }

  if (pathname.startsWith("/kampanye/")) {
    return `/dashboard${pathname}`;
  }

  return ALIAS_TO_INTERNAL[pathname] ?? null;
}

export function getAdminPageTitle(pathname: string) {
  if (pathname === ADMIN_ROUTE_PATHS.artikelCreate) {
    return "Tulis Artikel";
  }

  if (pathname.startsWith("/artikel/") && pathname.endsWith("/edit")) {
    return "Edit Artikel";
  }

  if (pathname.startsWith(`${ADMIN_ROUTE_PATHS.kampanye}/`)) {
    if (pathname === ADMIN_ROUTE_PATHS.kampanyeCreate) {
      return "Buat Kampanye";
    }

    return "Detail Kampanye";
  }

  return PAGE_TITLES[pathname] || "Dashboard";
}
