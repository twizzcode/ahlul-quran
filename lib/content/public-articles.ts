export type PublicArticleType = "berita" | "artikel";

type PublicArticleLike = {
  type: PublicArticleType;
};

export const publicArticleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  type: true,
  publishedAt: true,
  createdAt: true,
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
  donationCampaign: {
    select: {
      title: true,
      slug: true,
    },
  },
};

export type PublicArticleRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  type: PublicArticleType;
  publishedAt: Date | null;
  createdAt: Date;
  viewCount: number;
  author: {
    name: string;
    image: string | null;
  };
  category: {
    name: string;
    slug: string;
  } | null;
  donationCampaign: {
    title: string;
    slug: string;
  } | null;
}

export function getPublicArticleType(
  article: PublicArticleLike
): PublicArticleType {
  return article.type;
}
