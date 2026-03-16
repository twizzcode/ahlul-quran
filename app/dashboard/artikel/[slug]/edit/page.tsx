import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArticleEditorForm } from "@/components/article-editor-form";
import { getExplicitArticleType } from "@/lib/public-articles";

type DashboardArtikelEditPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function DashboardArtikelEditPage({
  params,
}: DashboardArtikelEditPageProps) {
  const { slug } = await params;

  const [categories, campaigns, article] = await Promise.all([
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.donationCampaign.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
        categoryId: true,
        donationCampaignId: true,
        tags: true,
      },
    }),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <ArticleEditorForm
      mode="edit"
      categories={categories}
      campaigns={campaigns}
      initialArticle={article}
      initialType={getExplicitArticleType(article.tags) || "artikel"}
    />
  );
}
