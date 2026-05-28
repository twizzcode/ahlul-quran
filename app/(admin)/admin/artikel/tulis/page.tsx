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

  const campaigns = await db.query.donationCampaign.findMany({
    columns: { id: true, title: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return <ArticleEditorForm mode="create" campaigns={campaigns} initialType={initialType} />;
}
