import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { PublicContentSearch } from "@/components/public-content-search";
import prisma from "@/lib/prisma";
import { getPublicArticleType, publicArticleSelect } from "@/lib/public-articles";
import { formatDate, truncateText } from "@/lib/utils";
import { stripHtmlTags } from "@/lib/article-content";

export const metadata: Metadata = {
  title: "Berita",
  description: "Ikuti berita terbaru, pengumuman, dan kabar gerakan Masjid Ahlul Qur'an",
};

const PAGE_SIZE = 9;

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const where = {
    status: "PUBLISHED" as const,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const allArticles = await prisma.article.findMany({
    where,
    select: publicArticleSelect,
    orderBy: {
      publishedAt: "desc",
    },
  });

  const filteredArticles = allArticles.filter(
    (article) => getPublicArticleType(article) === "berita"
  );
  const total = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page ?? "1") || 1), totalPages);
  const articles = filteredArticles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  function createPageHref(next: number) {
    const query = new URLSearchParams();

    if (q) query.set("q", q);
    query.set("page", String(next));

    return `/berita?${query.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <PageIntro
        className="mb-8"
        title="Berita"
        description="Ikuti berita terbaru, pengumuman, dan kabar gerakan Masjid Ahlul Qur'an."
        primaryAction={{ label: "Lihat Artikel Terkini", href: "/artikel" }}
      />

      <PublicContentSearch initialQuery={q} placeholder="Cari berita..." />

      {articles.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Berita belum tersedia untuk filter ini.
        </div>
      ) : (
        <div className="space-y-4 xl:grid xl:grid-cols-3 xl:gap-6 xl:space-y-0">
          {articles.map((article) => {
            const publishedDate = article.publishedAt ?? article.createdAt;

            return (
              <Link
                key={article.id}
                href={`/berita/${article.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-emerald-100/70 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:gap-4 sm:p-4 xl:h-full xl:flex-col"
              >
                {article.coverImage ? (
                  <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md sm:w-40 xl:w-full">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-28 shrink-0 rounded-md bg-muted sm:w-40 xl:w-full" />
                )}

                <div className="min-w-0 flex flex-1 self-stretch flex-col justify-between">
                  <div>
                    <h2 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary sm:text-lg">
                      {article.title}
                    </h2>
                    <p className="hidden xl:mt-3 xl:line-clamp-2 xl:text-sm xl:leading-6 xl:text-muted-foreground">
                      {truncateText(article.excerpt || stripHtmlTags(article.content), 180)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground xl:pt-4">
                    <span>{formatDate(publishedDate)}</span>
                    <span>•</span>
                    <span>{getReadingTime(article.content)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-2">
        {prevPage ? (
          <Link
            href={createPageHref(prevPage)}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Sebelumnya
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground opacity-50">
            Sebelumnya
          </span>
        )}

        <span className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {page}
        </span>

        {nextPage ? (
          <Link
            href={createPageHref(nextPage)}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Selanjutnya
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground opacity-50">
            Selanjutnya
          </span>
        )}
      </div>
    </div>
  );
}
