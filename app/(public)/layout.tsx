import type { Metadata } from "next";
import { headers } from "next/headers";
import { HomeLayoutShell } from "@/components/home/home-layout-shell";
import { auth } from "@/lib/auth/auth";
import dbQuery from "@/lib/data/db-query";
import { getPublicArticleType, publicArticleSelect } from "@/lib/content/public-articles";
import { stripHtmlTags } from "@/lib/content/article-content";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";
import { formatDate, truncateText } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Masjid Ahlul Qur'an - Website Resmi",
    template: "%s | Masjid Ahlul Qur'an",
  },
  description:
    "Website resmi Masjid Ahlul Qur'an - profil markas dakwah, kegiatan, donasi, dan gerakan umat.",
};

export const dynamic = "force-dynamic";

// ============================================================
// Public Site Layout (masjidcontoh.com)
// ============================================================

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const [profile, session, latestArticles] = await Promise.all([
    getMasjidProfileData(),
    auth.api.getSession({
      headers: new Headers(headerStore),
    }),
    dbQuery.article.findMany({
      where: { status: "PUBLISHED" },
      select: publicArticleSelect,
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
  ]);
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;
  const featuredNewsArticle = latestArticles.find(
    (article) => getPublicArticleType(article) === "berita"
  );
  const featuredNews = featuredNewsArticle
    ? {
        title: featuredNewsArticle.title,
        href: `/berita/${featuredNewsArticle.slug}`,
        image: featuredNewsArticle.coverImage,
        excerpt: truncateText(
          featuredNewsArticle.excerpt?.trim()
            ? featuredNewsArticle.excerpt
            : stripHtmlTags(featuredNewsArticle.content),
          140
        ),
        publishedAtLabel: formatDate(
          featuredNewsArticle.publishedAt ?? featuredNewsArticle.createdAt
        ),
      }
    : null;

  return (
    <HomeLayoutShell profile={profile} user={user} featuredNews={featuredNews}>
      {children}
    </HomeLayoutShell>
  );
}
