export const ADMIN_ROUTE_PATHS = {
  dashboard: "/",
  artikel: "/artikel",
  artikelCreate: "/artikel/tulis",
  donasi: "/donasi",
  kampanye: "/kampanye",
  kampanyeCreate: "/kampanye/tulis",
  galeri: "/galeri",
  homepage: "/homepage",
  profile: "/profil-masjid",
  profileTimeline: "/profil-masjid/tahapan-pendirian",
  profileCommittee: "/profil-masjid/struktur-panitia",
  profileSocial: "/profil-masjid/sosial-media",
  profileBank: "/profil-masjid/rekening-donasi",
  pengguna: "/pengguna",
} as const;

export const ADMIN_NAV_ITEMS = {
  main: [
    { title: "Dashboard", url: ADMIN_ROUTE_PATHS.dashboard },
    { title: "Berita dan Artikel", url: ADMIN_ROUTE_PATHS.artikel },
    { title: "Donasi", url: ADMIN_ROUTE_PATHS.donasi },
    { title: "Kampanye", url: ADMIN_ROUTE_PATHS.kampanye },
    { title: "Galeri", url: ADMIN_ROUTE_PATHS.galeri },
  ],
  settings: [
    { title: "Homepage", url: ADMIN_ROUTE_PATHS.homepage },
    { title: "Profile", url: ADMIN_ROUTE_PATHS.profile },
    { title: "Pengguna", url: ADMIN_ROUTE_PATHS.pengguna },
  ],
} as const;

const INTERNAL_TO_ALIAS: Record<string, string> = {
  "/admin": ADMIN_ROUTE_PATHS.dashboard,
  "/admin/": ADMIN_ROUTE_PATHS.dashboard,
  "/admin/artikel": ADMIN_ROUTE_PATHS.artikel,
  "/admin/artikel/tulis": ADMIN_ROUTE_PATHS.artikelCreate,
  "/admin/donasi": ADMIN_ROUTE_PATHS.donasi,
  "/admin/kampanye": ADMIN_ROUTE_PATHS.kampanye,
  "/admin/kampanye/tulis": ADMIN_ROUTE_PATHS.kampanyeCreate,
  "/admin/galeri": ADMIN_ROUTE_PATHS.galeri,
  "/admin/homepage": ADMIN_ROUTE_PATHS.homepage,
  "/admin/profil-masjid": ADMIN_ROUTE_PATHS.profile,
  "/admin/profil-masjid/tahapan-pendirian": ADMIN_ROUTE_PATHS.profileTimeline,
  "/admin/profil-masjid/struktur-panitia": ADMIN_ROUTE_PATHS.profileCommittee,
  "/admin/profil-masjid/sosial-media": ADMIN_ROUTE_PATHS.profileSocial,
  "/admin/profil-masjid/rekening-donasi": ADMIN_ROUTE_PATHS.profileBank,
  "/admin/pengguna": ADMIN_ROUTE_PATHS.pengguna,
  "/dashboard": ADMIN_ROUTE_PATHS.dashboard,
  "/dashboard/": ADMIN_ROUTE_PATHS.dashboard,
  "/dashboard/artikel": ADMIN_ROUTE_PATHS.artikel,
  "/dashboard/artikel/tulis": ADMIN_ROUTE_PATHS.artikelCreate,
  "/dashboard/donasi": ADMIN_ROUTE_PATHS.donasi,
  "/dashboard/kampanye": ADMIN_ROUTE_PATHS.kampanye,
  "/dashboard/kampanye/tulis": ADMIN_ROUTE_PATHS.kampanyeCreate,
  "/dashboard/galeri": ADMIN_ROUTE_PATHS.galeri,
  "/dashboard/homepage": ADMIN_ROUTE_PATHS.homepage,
  "/dashboard/profil-masjid": ADMIN_ROUTE_PATHS.profile,
  "/dashboard/profil-masjid/tahapan-pendirian": ADMIN_ROUTE_PATHS.profileTimeline,
  "/dashboard/profil-masjid/struktur-panitia": ADMIN_ROUTE_PATHS.profileCommittee,
  "/dashboard/profil-masjid/sosial-media": ADMIN_ROUTE_PATHS.profileSocial,
  "/dashboard/profil-masjid/rekening-donasi": ADMIN_ROUTE_PATHS.profileBank,
  "/dashboard/pengguna": ADMIN_ROUTE_PATHS.pengguna,
  "/homepage": ADMIN_ROUTE_PATHS.homepage,
  "/profil-masjid": ADMIN_ROUTE_PATHS.profile,
  "/profil-masjid/tahapan-pendirian": ADMIN_ROUTE_PATHS.profileTimeline,
  "/profil-masjid/struktur-panitia": ADMIN_ROUTE_PATHS.profileCommittee,
  "/profil-masjid/sosial-media": ADMIN_ROUTE_PATHS.profileSocial,
  "/profil-masjid/rekening-donasi": ADMIN_ROUTE_PATHS.profileBank,
};

const ALIAS_TO_INTERNAL: Record<string, string> = {
  [ADMIN_ROUTE_PATHS.dashboard]: "/admin",
  [ADMIN_ROUTE_PATHS.artikel]: "/admin/artikel",
  [ADMIN_ROUTE_PATHS.artikelCreate]: "/admin/artikel/tulis",
  [ADMIN_ROUTE_PATHS.donasi]: "/admin/donasi",
  [ADMIN_ROUTE_PATHS.kampanye]: "/admin/kampanye",
  [ADMIN_ROUTE_PATHS.kampanyeCreate]: "/admin/kampanye/tulis",
  [ADMIN_ROUTE_PATHS.galeri]: "/admin/galeri",
  [ADMIN_ROUTE_PATHS.homepage]: "/admin/homepage",
  [ADMIN_ROUTE_PATHS.profile]: "/admin/profil-masjid",
  [ADMIN_ROUTE_PATHS.profileTimeline]: "/admin/profil-masjid/tahapan-pendirian",
  [ADMIN_ROUTE_PATHS.profileCommittee]: "/admin/profil-masjid/struktur-panitia",
  [ADMIN_ROUTE_PATHS.profileSocial]: "/admin/profil-masjid/sosial-media",
  [ADMIN_ROUTE_PATHS.profileBank]: "/admin/profil-masjid/rekening-donasi",
  [ADMIN_ROUTE_PATHS.pengguna]: "/admin/pengguna",
  "/dashboard": ADMIN_ROUTE_PATHS.dashboard,
  "/dashboard/artikel": ADMIN_ROUTE_PATHS.artikel,
  "/dashboard/artikel/tulis": ADMIN_ROUTE_PATHS.artikelCreate,
  "/dashboard/donasi": ADMIN_ROUTE_PATHS.donasi,
  "/dashboard/kampanye": ADMIN_ROUTE_PATHS.kampanye,
  "/dashboard/kampanye/tulis": ADMIN_ROUTE_PATHS.kampanyeCreate,
  "/dashboard/galeri": ADMIN_ROUTE_PATHS.galeri,
  "/dashboard/homepage": ADMIN_ROUTE_PATHS.homepage,
  "/dashboard/profil-masjid": ADMIN_ROUTE_PATHS.profile,
  "/dashboard/pengguna": ADMIN_ROUTE_PATHS.pengguna,
};

const PAGE_TITLES: Record<string, string> = {
  [ADMIN_ROUTE_PATHS.dashboard]: "Dashboard",
  [ADMIN_ROUTE_PATHS.artikel]: "Berita dan Artikel",
  [ADMIN_ROUTE_PATHS.donasi]: "Donasi",
  [ADMIN_ROUTE_PATHS.kampanye]: "Kampanye",
  [ADMIN_ROUTE_PATHS.kampanyeCreate]: "Buat Kampanye",
  [ADMIN_ROUTE_PATHS.galeri]: "Galeri",
  [ADMIN_ROUTE_PATHS.homepage]: "Homepage",
  [ADMIN_ROUTE_PATHS.profile]: "Profile",
  [ADMIN_ROUTE_PATHS.profileTimeline]: "Tahapan Pendirian",
  [ADMIN_ROUTE_PATHS.profileCommittee]: "Struktur",
  [ADMIN_ROUTE_PATHS.profileSocial]: "Sosial Media",
  [ADMIN_ROUTE_PATHS.profileBank]: "Rekening Donasi",
  [ADMIN_ROUTE_PATHS.pengguna]: "Pengguna",
};

export function getAdminAliasPath(pathname: string) {
  if (pathname.startsWith("/admin/artikel/") && pathname.endsWith("/edit")) {
    return pathname.replace("/admin", "");
  }

  if (pathname.startsWith("/dashboard/artikel/") && pathname.endsWith("/edit")) {
    return pathname.replace("/dashboard", "");
  }

  if (pathname.startsWith("/admin/kampanye/")) {
    return pathname.replace("/admin", "");
  }

  if (pathname.startsWith("/admin/profil-masjid/")) {
    return pathname.replace("/admin", "");
  }

  if (pathname.startsWith("/dashboard/kampanye/")) {
    return pathname.replace("/dashboard", "");
  }

  if (pathname.startsWith("/dashboard/profil-masjid/")) {
    return pathname.replace("/dashboard", "");
  }

  return INTERNAL_TO_ALIAS[pathname] ?? null;
}

export function getAdminInternalPath(pathname: string) {
  if (pathname.startsWith("/artikel/") && pathname.endsWith("/edit")) {
    return `/admin${pathname}`;
  }

  if (pathname.startsWith("/kampanye/")) {
    return `/admin${pathname}`;
  }

  if (pathname.startsWith("/profil-masjid/")) {
    return `/admin${pathname}`;
  }

  return ALIAS_TO_INTERNAL[pathname] ?? pathname;
}

export function getAdminPageTitle(pathname: string) {
  if (pathname === ADMIN_ROUTE_PATHS.artikelCreate) {
    return "Tulis Berita atau Artikel";
  }

  if (pathname.startsWith("/artikel/") && pathname.endsWith("/edit")) {
    return "Edit Berita atau Artikel";
  }

  if (pathname.startsWith(`${ADMIN_ROUTE_PATHS.kampanye}/`)) {
    if (pathname === ADMIN_ROUTE_PATHS.kampanyeCreate) {
      return "Buat Kampanye";
    }

    return "Detail Kampanye";
  }

  return PAGE_TITLES[pathname] || "Dashboard";
}
