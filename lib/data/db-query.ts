/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/src";
import {
  article,
  donation,
  donationCampaign,
  galleryImage,
} from "@/src/db/schema";

type QueryArgs = Record<string, any>;

function take(args?: QueryArgs) {
  return typeof args?.take === "number" ? args.take : undefined;
}

function donationOrderBy(args?: QueryArgs) {
  const orderBy = args?.orderBy;

  if (orderBy?.amount === "desc") return [desc(donation.amount)];
  return [desc(donation.createdAt)];
}

function articleOrderBy() {
  return [desc(article.publishedAt), desc(article.createdAt)];
}

function articleWhere(args?: QueryArgs) {
  const where = args?.where ?? {};
  const clauses = [];

  if (where.status) {
    clauses.push(eq(article.status, where.status));
  }

  if (where.slug) {
    clauses.push(eq(article.slug, where.slug));
  }

  if (where.type) {
    clauses.push(eq(article.type, where.type));
  }

  if (where.NOT?.id) {
    clauses.push(ne(article.id, where.NOT.id));
  }

  if (where.id?.not) {
    clauses.push(ne(article.id, where.id.not));
  }

  if (Array.isArray(where.OR) && where.OR.length > 0) {
    const orClauses = where.OR.flatMap((item: QueryArgs) => {
      if (item.title?.contains) return [ilike(article.title, `%${item.title.contains}%`)];
      if (item.excerpt?.contains) return [ilike(article.excerpt, `%${item.excerpt.contains}%`)];
      if (item.content?.contains) return [ilike(article.content, `%${item.content.contains}%`)];
      if (item.coverImage) return [eq(article.coverImage, item.coverImage)];
      return [];
    });

    if (orClauses.length > 0) {
      clauses.push(or(...orClauses));
    }
  }

  return clauses.length > 0 ? and(...clauses) : undefined;
}

function campaignWhere(args?: QueryArgs) {
  const where = args?.where ?? {};
  const clauses = [];

  if (typeof where.isActive === "boolean") {
    clauses.push(eq(donationCampaign.isActive, where.isActive));
  }

  if (where.slug) {
    clauses.push(eq(donationCampaign.slug, where.slug));
  }

  if (where.id) {
    clauses.push(eq(donationCampaign.id, where.id));
  }

  return clauses.length > 0 ? and(...clauses) : undefined;
}

async function findCampaignBySlug(args: QueryArgs) {
  return db.query.donationCampaign.findFirst({
    where: campaignWhere(args),
    with: {
      donations: {
        where: eq(donation.status, "SUCCESS"),
        orderBy: donationOrderBy(args.include?.donations),
        limit: take(args.include?.donations),
      },
      updates: {
        where: eq(article.status, "PUBLISHED"),
        with: {
          category: true,
        },
        orderBy: articleOrderBy(),
      },
      galleries: {
        with: {
          images: {
            orderBy: [galleryImage.order],
          },
        },
        orderBy: (gallery, { desc }) => [desc(gallery.createdAt)],
      },
    },
  });
}

const prisma = {
  article: {
    findMany(args?: QueryArgs) {
      return db.query.article.findMany({
        where: articleWhere(args),
        with: {
          author: true,
          category: true,
          donationCampaign: true,
        },
        orderBy: articleOrderBy(),
        limit: take(args),
      });
    },
    async findFirst(args?: QueryArgs) {
      const row = await db.query.article.findFirst({
        where: articleWhere(args),
        with: {
          author: true,
          category: true,
          donationCampaign: true,
        },
        orderBy: articleOrderBy(),
      });
      return row ?? null;
    },
  },
  donationCampaign: {
    findMany(args?: QueryArgs) {
      return db.query.donationCampaign.findMany({
        where: campaignWhere(args),
        with: {
          donations: {
            where: eq(donation.status, "SUCCESS"),
            orderBy: donationOrderBy(args?.include?.donations),
          },
        },
        orderBy: [desc(donationCampaign.createdAt)],
        limit: take(args),
      });
    },
    async findFirst(args?: QueryArgs) {
      const campaigns = await db.query.donationCampaign.findMany({
        where: campaignWhere(args),
        with: {
          donations: {
            where: eq(donation.status, "SUCCESS"),
            orderBy: donationOrderBy(args?.include?.donations),
          },
        },
        orderBy: [desc(donationCampaign.createdAt)],
      });

      const orItems = args?.where?.OR;
      if (!Array.isArray(orItems)) return campaigns[0] ?? null;

      return (
        campaigns.find((campaign) =>
          orItems.some((item: QueryArgs) => {
            if (item.slug) return campaign.slug === item.slug;
            const titleContains = item.title?.contains;
            return (
              typeof titleContains === "string" &&
              campaign.title.toLowerCase().includes(titleContains.toLowerCase())
            );
          }),
        ) ?? null
      );
    },
    async findUnique(args: QueryArgs) {
      const row = await findCampaignBySlug(args);
      return row ?? null;
    },
  },
  donation: {
    findMany(args?: QueryArgs) {
      const clauses = [];
      if (args?.where?.status) clauses.push(eq(donation.status, args.where.status));
      if (args?.where?.userId) clauses.push(eq(donation.userId, args.where.userId));

      return db.query.donation.findMany({
        where: clauses.length > 0 ? and(...clauses) : undefined,
        with: {
          campaign: true,
        },
        orderBy: [desc(donation.createdAt)],
        limit: take(args),
      });
    },
  },
  gallery: {
    findMany(args?: QueryArgs) {
      void args;
      return db.query.gallery.findMany({
        with: {
          images: {
            orderBy: [galleryImage.order],
          },
        },
        orderBy: (gallery, { desc }) => [desc(gallery.createdAt)],
      });
    },
  },
  galleryImage: {
    async count(args?: QueryArgs) {
      const clauses = [];
      if (args?.where?.url) clauses.push(eq(galleryImage.url, args.where.url));
      if (args?.where?.galleryId?.not) {
        clauses.push(ne(galleryImage.galleryId, args.where.galleryId.not));
      }

      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(galleryImage)
        .where(clauses.length > 0 ? and(...clauses) : undefined);

      return rows[0]?.count ?? 0;
    },
  },
  masjidProfile: {
    findFirst() {
      return db.query.masjidProfile.findFirst();
    },
  },
};

export default prisma;
