import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Eye, User } from "lucide-react";
import { ArticleDetailSidebar } from "@/components/article-detail-sidebar";
import prisma from "@/lib/prisma";
import {
  getPublicArticleType,
  getVisibleArticleTags,
  publicArticleSelect,
  type PublicArticleRecord,
} from "@/lib/public-articles";
import { formatDate, truncateText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  isProbablyHtml,
  sanitizeArticleHtml,
  stripHtmlTags,
} from "@/lib/article-content";

type ArtikelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function getReadingTime(content: string) {
  const words = stripHtmlTags(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

function getDescription(article: { excerpt: string | null; content: string }) {
  if (article.excerpt?.trim()) {
    return article.excerpt;
  }

  return truncateText(stripHtmlTags(article.content), 180);
}

async function getPublishedArticleBySlug(slug: string): Promise<PublicArticleRecord | null> {
  return prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: publicArticleSelect,
  });
}

export async function generateMetadata({ params }: ArtikelDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Berita Tidak Ditemukan",
      description: "Konten yang Anda cari tidak tersedia.",
    };
  }

  const publishedDate = article.publishedAt ?? article.createdAt;
  const description = getDescription(article);
  const articleUrl = `/artikel/${article.slug}`;

  return {
    title: `${article.title} | Masjid`,
    description,
    keywords: getVisibleArticleTags(article.tags),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: publishedDate.toISOString(),
      authors: [article.author.name],
      url: articleUrl,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArtikelDetailPage({ params }: ArtikelDetailPageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt ?? article.createdAt;
  const readingTime = getReadingTime(article.content);
  const isHtmlContent = isProbablyHtml(article.content);
  const safeHtml = sanitizeArticleHtml(article.content);
  const relatedArticlesRaw = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      NOT: {
        id: article.id,
      },
    },
    select: publicArticleSelect,
    orderBy: {
      publishedAt: "desc",
    },
    take: 12,
  });
  const relatedArticles = relatedArticlesRaw
    .filter((item) => getPublicArticleType(item) === "artikel")
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      href: `/artikel/${item.slug}`,
      coverImage: item.coverImage,
      categoryName: item.category?.name ?? null,
      publishedAt: (item.publishedAt ?? item.createdAt).toISOString(),
    }));

  return (
    <article className="mx-auto w-full max-w-7xl px-4 md:px-0 pb-12 pt-[calc(var(--home-nav-height)+1rem)]">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
        <div>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight capitalize text-emerald-950 md:text-4xl">
              {article.title}
            </h1>

            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium">
                {article.category?.name ?? "Umum"}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime}
              </span>
            </div>

            {article.coverImage && (
              <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-end gap-4 text-sm text-muted-foreground md:gap-6">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {article.author.name}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {article.viewCount} kali dilihat
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(publishedDate)}
              </span>
            </div>

            <hr className="mt-8 border-border" />
          </header>

          <div className="prose prose-slate max-w-none [&_img]:aspect-[4/3] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-cover dark:prose-invert">
            {isHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            ) : (
              article.content
                .split(/\n\n+/)
                .filter((paragraph) => paragraph.trim().length > 0)
                .map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 24)}`} className="leading-7">
                    {paragraph}
                  </p>
                ))
            )}
          </div>

          <footer className="mt-12 pt-8 border-t">
            <Button variant="outline" asChild>
              <Link href="/artikel">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Lihat Artikel Lainnya
              </Link>
            </Button>
          </footer>
        </div>

        <ArticleDetailSidebar
          title="Artikel Lainnya"
          href="/artikel"
          hrefLabel="Lihat artikel terkini"
          items={relatedArticles}
        />
      </div>
    </article>
  );
}
