import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDateTime, truncateText } from "@/lib/utils";
import { getPublicArticleType } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

type DashboardArtikelPageProps = {
  searchParams: Promise<{
    type?: string;
    category?: string;
    q?: string;
  }>;
};

export default async function DashboardArtikelPage({
  searchParams,
}: DashboardArtikelPageProps) {
  const params = await searchParams;
  const category = params.category?.trim() || "";
  const q = params.q?.trim() || "";
  const type = params.type?.trim() || "";

  const where: Record<string, unknown> = {};

  if (category) {
    where.categoryId = category;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const filteredArticles =
    type === "artikel" || type === "berita"
      ? articles.filter((article) => getPublicArticleType(article) === type)
      : articles;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artikel</h1>
          <p className="text-sm text-muted-foreground">
            Kelola artikel, kajian, dan konten website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/artikel/tulis?type=berita">+ Tulis Berita</Link>
          </Button>
          <Button asChild>
            <Link href="/artikel/tulis?type=artikel">+ Tulis Artikel</Link>
          </Button>
        </div>
      </div>

      <form className="mb-6 flex flex-wrap gap-3" method="get">
        <select
          name="type"
          defaultValue={type}
          className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Semua Jenis</option>
          <option value="artikel">Artikel</option>
          <option value="berita">Berita</option>
        </select>
        <select
          name="category"
          defaultValue={category}
          className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Semua Kategori</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          placeholder="Cari artikel..."
          defaultValue={q}
          className="flex h-9 w-72 rounded-md border border-input bg-background px-3 text-sm"
        />
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Judul</th>
              <th className="p-4 text-left font-medium">Jenis</th>
              <th className="p-4 text-left font-medium">Kategori</th>
              <th className="p-4 text-left font-medium">Penulis</th>
              <th className="p-4 text-left font-medium">Views</th>
              <th className="p-4 text-left font-medium">Updated</th>
              <th className="p-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
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
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-muted-foreground">
                            No Cover
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {truncateText(article.excerpt || article.content, 120)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                      {getPublicArticleType(article)}
                    </span>
                  </td>
                  <td className="p-4">{article.category?.name || "-"}</td>
                  <td className="p-4">{article.author.name}</td>
                  <td className="p-4">{article.viewCount}</td>
                  <td className="p-4">{formatDateTime(article.updatedAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/artikel/${article.slug}/edit`}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/artikel/${article.slug}`} target="_blank">
                          Lihat
                        </Link>
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
