import prisma from "@/lib/prisma";
import { ArticleEditorForm } from "@/components/article-editor-form";
import type { PublicArticleType } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function DashboardArtikelTulisPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const initialType: PublicArticleType = params.type === "berita" ? "berita" : "artikel";

  const categories = await prisma.articleCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
  const campaigns = await prisma.donationCampaign.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <ArticleEditorForm
      mode="create"
      categories={categories}
      campaigns={campaigns}
      initialType={initialType}
    />
  );
}
