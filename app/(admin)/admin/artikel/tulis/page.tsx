import { ArticleEditorForm } from "@/components/content/article-editor-form";
import type { PublicArticleType } from "@/lib/content/public-articles";
import { db } from "@/src";

export const dynamic = "force-dynamic";

export default async function DashboardArtikelTulisPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const initialType: PublicArticleType = params.type === "berita" ? "berita" : "artikel";

  const [categories, campaigns] = await Promise.all([
    db.query.articleCategory.findMany({
      columns: { id: true, name: true },
      orderBy: (table, { asc }) => [asc(table.name)],
    }),
    db.query.donationCampaign.findMany({
      columns: { id: true, title: true },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
  ]);

  return <ArticleEditorForm mode="create" categories={categories} campaigns={campaigns} initialType={initialType} />;
}
