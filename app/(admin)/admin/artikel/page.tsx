import Image from "next/image";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { DashboardArticleFilters } from "@/components/dashboard/content/dashboard-article-filters";
import { Button } from "@/components/ui/button";
import { getAdminInternalPath } from "@/lib/routing/admin-routes";
import { article as articleTable } from "@/src/db/schema";
import { db } from "@/src";
import { formatDateTime, truncateText } from "@/lib/utils";
import { stripHtmlTags } from "@/lib/content/article-content";
import { getPublicArticleType } from "@/lib/content/public-articles";

export const dynamic = "force-dynamic";

type DashboardArtikelPageProps = {
  searchParams: Promise<{
    type?: string;
    q?: string;
  }>;
};

export default async function DashboardArtikelPage({ searchParams }: DashboardArtikelPageProps) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() || "";
  const type = params.type?.trim() || "";

  const articles = await db.query.article.findMany({
    with: {
      author: { columns: { name: true } },
      category: { columns: { id: true, name: true, slug: true } },
    },
    orderBy: [desc(articleTable.updatedAt)],
    limit: 100,
  });

  const filteredArticles = articles.filter((article) => {
    if (type && getPublicArticleType(article) !== type) return false;
    if (!q) return true;

    const haystack = [article.title, article.excerpt ?? "", article.content].join(" ").toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Berita dan Artikel</h1>
          <p className="text-sm text-muted-foreground">Kelola berita, artikel, kajian, dan konten website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`${getAdminInternalPath("/artikel/tulis")}?type=berita`}>+ Tulis Berita</Link>
          </Button>
          <Button asChild>
            <Link href={`${getAdminInternalPath("/artikel/tulis")}?type=artikel`}>+ Tulis Artikel</Link>
          </Button>
        </div>
      </div>

      <DashboardArticleFilters initialType={type} initialQuery={params.q ?? ""} />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Judul</th>
              <th className="p-4 text-left font-medium">Jenis</th>
              <th className="p-4 text-left font-medium">Penulis</th>
              <th className="p-4 text-left font-medium">Views</th>
              <th className="p-4 text-left font-medium">Updated</th>
              <th className="p-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada konten. Klik tombol tulis di atas untuk membuat artikel atau berita baru.
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr key={article.id} className="border-b last:border-b-0">
                  <td className="p-4">
                    <div className="flex max-w-md items-start gap-3">
                      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                        {article.coverImage ? (
                          <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">No Cover</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {truncateText(article.excerpt || stripHtmlTags(article.content), 120)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">{getPublicArticleType(article)}</span></td>
                  <td className="p-4">{article.author.name}</td>
                  <td className="p-4">{article.viewCount}</td>
                  <td className="p-4">{formatDateTime(article.updatedAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={getAdminInternalPath(`/artikel/${article.slug}/edit`)}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/${getPublicArticleType(article)}/${article.slug}`} target="_blank">Lihat</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
