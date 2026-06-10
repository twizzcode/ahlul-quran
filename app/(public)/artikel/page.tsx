import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/content/page-intro";
import { PublicContentSearch } from "@/components/content/public-content-search";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import dbQuery from "@/lib/data/db-query";
import { getPublicArticleType, publicArticleSelect } from "@/lib/content/public-articles";
import { formatDate, truncateText } from "@/lib/utils";
import { stripHtmlTags } from "@/lib/content/article-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Artikel",
  description: "Baca artikel kajian, khutbah, dan materi pembinaan Masjid Ahlul Qur'an",
  path: "/artikel",
});

const PAGE_SIZE = 9;

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages] as const;
}

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const sort = params.sort === "oldest" ? "oldest" : "newest";

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

  const allArticles = await dbQuery.article.findMany({
    where,
    select: publicArticleSelect,
    orderBy: {
      publishedAt: "desc",
    },
  });

  const filteredArticles = allArticles
    .filter((article) => getPublicArticleType(article) === "artikel")
    .sort((left, right) => {
      const leftTime = (left.publishedAt ?? left.createdAt).getTime();
      const rightTime = (right.publishedAt ?? right.createdAt).getTime();
      return sort === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });
  const total = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page ?? "1") || 1), totalPages);
  const articles = filteredArticles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const pageItems = buildPageItems(page, totalPages);

  function createPageHref(next: number) {
    const query = new URLSearchParams();

    if (q) query.set("q", q);
    if (sort === "oldest") query.set("sort", sort);
    query.set("page", String(next));

    return `/artikel?${query.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <PageIntro
        className="mb-8"
        title="Artikel"
        description="Baca artikel kajian, khutbah, dan materi pembinaan Masjid Ahlul Qur'an."
        primaryAction={{ label: "Lihat Berita Terkini", href: "/berita" }}
      />

      <PublicContentSearch initialQuery={q} initialSort={sort} placeholder="Cari artikel..." />

      {articles.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Artikel belum tersedia untuk filter ini.
        </div>
      ) : (
        <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-6 xl:space-y-0">
          {articles.map((article) => {
            const publishedDate = article.publishedAt ?? article.createdAt;

            return (
              <Link
                key={article.id}
                href={`/artikel/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-[22px] border border-emerald-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:flex-row sm:items-start"
              >
                {article.coverImage ? (
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted sm:w-44 xl:w-52">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full shrink-0 bg-muted sm:w-44 xl:w-52" />
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch p-4">
                  <div>
                    <h2 className="line-clamp-2 text-base font-bold leading-tight text-slate-900 capitalize">
                      {article.title}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {truncateText(article.excerpt || stripHtmlTags(article.content), 120)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={prevPage ? createPageHref(prevPage) : "#"}
              aria-disabled={!prevPage}
              className={!prevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pageItems.map((item, index) => {
            if (typeof item !== "number") {
              return (
                <PaginationItem key={`${item}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={item}>
                <PaginationLink
                  href={createPageHref(item)}
                  isActive={item === page}
                  className="cursor-pointer rounded-xl border-emerald-100 data-[active=true]:border-emerald-900 data-[active=true]:bg-emerald-900 data-[active=true]:text-white"
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href={nextPage ? createPageHref(nextPage) : "#"}
              aria-disabled={!nextPage}
              className={!nextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
