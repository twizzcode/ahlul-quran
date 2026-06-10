import type { MetadataRoute } from "next";
import dbQuery from "@/lib/data/db-query";
import { getSiteUrl } from "@/lib/seo";
import { getPublicArticleType, publicArticleSelect } from "@/lib/content/public-articles";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticRoutes = [
    "/",
    "/profil",
    "/program",
    "/donasi",
    "/berita",
    "/artikel",
    "/galeri",
    "/terms-of-service",
    "/privacy-policy",
  ];

  const [articles, campaigns] = await Promise.all([
    dbQuery.article.findMany({
      where: { status: "PUBLISHED" },
      select: publicArticleSelect,
      orderBy: { publishedAt: "desc" },
    }),
    dbQuery.donationCampaign.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const articleRoutes = articles.map((article) => {
    const type = getPublicArticleType(article);
    const route = type === "berita" ? `/berita/${article.slug}` : `/artikel/${article.slug}`;

    return {
      url: new URL(route, siteUrl).toString(),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  const campaignRoutes = campaigns.map((campaign) => ({
    url: new URL(`/donasi/${campaign.slug}`, siteUrl).toString(),
    lastModified: campaign.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes.map((route, index) => ({
      url: new URL(route, siteUrl).toString(),
      lastModified: now,
      changeFrequency: route === "/" ? ("daily" as const) : ("weekly" as const),
      priority: index === 0 ? 1 : 0.7,
    })),
    ...articleRoutes,
    ...campaignRoutes,
  ];
}
