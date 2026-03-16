import type { Prisma } from "@/lib/generated/prisma/client";

export const NEWS_KEYWORDS = [
  "berita",
  "news",
  "pengumuman",
  "update",
  "laporan",
  "kabar",
] as const;

export type PublicArticleType = "berita" | "artikel";
export const ARTICLE_TYPE_TAG_PREFIX = "__type:";

type PublicArticleLike = {
  title: string;
  tags: string[];
  category: {
    name: string;
    slug: string;
  } | null;
};

export const publicArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  publishedAt: true,
  createdAt: true,
  tags: true,
  viewCount: true,
  author: {
    select: {
      name: true,
      image: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ArticleSelect;

export type PublicArticleRecord = Prisma.ArticleGetPayload<{
  select: typeof publicArticleSelect;
}>;

export function getExplicitArticleType(
  tags: string[] | null | undefined
): PublicArticleType | null {
  if (!Array.isArray(tags)) return null;

  const normalized = tags.find((tag) =>
    tag.toLowerCase().startsWith(ARTICLE_TYPE_TAG_PREFIX)
  );

  if (!normalized) return null;

  const value = normalized.slice(ARTICLE_TYPE_TAG_PREFIX.length).toLowerCase();
  return value === "berita" || value === "artikel" ? value : null;
}

export function withArticleTypeTag(
  tags: string[] | null | undefined,
  type: PublicArticleType
) {
  const cleanTags = (tags ?? []).filter(
    (tag) => !tag.toLowerCase().startsWith(ARTICLE_TYPE_TAG_PREFIX)
  );

  return [...cleanTags, `${ARTICLE_TYPE_TAG_PREFIX}${type}`];
}

export function getVisibleArticleTags(tags: string[] | null | undefined) {
  return (tags ?? []).filter(
    (tag) => !tag.toLowerCase().startsWith(ARTICLE_TYPE_TAG_PREFIX)
  );
}

export function getPublicArticleType(
  article: PublicArticleLike
): PublicArticleType {
  const explicitType = getExplicitArticleType(article.tags);
  if (explicitType) {
    return explicitType;
  }

  const haystack = [
    article.title,
    article.category?.name ?? "",
    article.category?.slug ?? "",
    ...article.tags,
  ]
    .join(" ")
    .toLowerCase();

  return NEWS_KEYWORDS.some((keyword) => haystack.includes(keyword))
    ? "berita"
    : "artikel";
}
