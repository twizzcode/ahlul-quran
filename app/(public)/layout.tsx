import type { Metadata } from "next";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { HomeLayoutShell } from "@/components/home/home-layout-shell";
import { auth } from "@/lib/auth/auth";
import dbQuery from "@/lib/data/db-query";
import { getPublicArticleType, publicArticleSelect } from "@/lib/content/public-articles";
import { stripHtmlTags } from "@/lib/content/article-content";
import { isDashboardRole } from "@/lib/auth/user-roles";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";
import { buildOrigin, getAdminHost } from "@/lib/routing/domain-routing";
import { db } from "@/src";
import { user as userTable } from "@/src/db/schema";
import { formatDate, truncateText } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: {
    default: "Masjid Semilyar Tangan - Website Resmi",
    template: "%s | Masjid Semilyar Tangan",
  },
  description:
    "Website resmi Masjid Semilyar Tangan untuk profil markas dakwah, program, berita, artikel, dan donasi umat.",
  path: "/",
});

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
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "lvh.me:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
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
  const dbUser = session?.user
    ? await db.query.user.findFirst({
        where: eq(userTable.id, session.user.id),
        columns: {
          role: true,
        },
      })
    : null;
  const adminUrl = buildOrigin(protocol, getAdminHost(host));
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        canOpenAdmin: isDashboardRole(dbUser?.role),
        adminUrl,
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
