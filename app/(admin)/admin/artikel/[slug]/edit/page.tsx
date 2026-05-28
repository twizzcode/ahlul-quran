import { notFound } from "next/navigation";
import { ArticleEditorForm } from "@/components/content/article-editor-form";
import { getExplicitArticleType } from "@/lib/content/public-articles";
import { db } from "@/src";

export const dynamic = "force-dynamic";

export default async function DashboardArtikelEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [campaigns, article] = await Promise.all([
    db.query.donationCampaign.findMany({
      columns: { id: true, title: true },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
    db.query.article.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
      columns: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImage: true,
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
      campaigns={campaigns}
      initialArticle={article}
      initialType={getExplicitArticleType(article.tags) || "artikel"}
    />
  );
}
