import type { Metadata } from "next";

export const DEFAULT_SITE_URL = "https://masjidsemilyartangan.com";

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return siteUrl ? siteUrl.replace(/\/+$/, "") : DEFAULT_SITE_URL;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${getSiteUrl()}/`).toString();
}

type PageMetadataOptions = {
  title: Metadata["title"];
  description: string;
  path?: string;
  openGraph?: Metadata["openGraph"];
  robots?: Metadata["robots"];
};

export function createPageMetadata({
  title,
  description,
  path = "/",
  openGraph,
  robots,
}: PageMetadataOptions): Metadata {
  const canonical = path === "/" ? "/" : path.replace(/\/+$/, "");

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: typeof title === "string" ? title : undefined,
      description,
      url: canonical,
      siteName: "Masjid Semilyar Tangan",
      locale: "id_ID",
      type: "website",
      ...openGraph,
    },
    robots,
  };
}

export function getOrganizationJsonLd() {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Place"],
    name: "Masjid Semilyar Tangan",
    url,
    logo: absoluteUrl("/logo.webp"),
    sameAs: [],
  };
}

export function getWebsiteJsonLd() {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Masjid Semilyar Tangan",
    url,
    inLanguage: "id-ID",
  };
}
