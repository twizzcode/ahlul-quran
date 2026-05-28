import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

export type HomeContentTabItem = {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  type: "berita" | "artikel";
};

type HomeContentTabsProps = {
  items: HomeContentTabItem[];
};

const MAX_ITEMS = 3;

export function HomeContentTabs({ items }: HomeContentTabsProps) {
  const activeItems = items.slice(0, MAX_ITEMS);

  return (
    <section className="py-28 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-emerald-950">
              Berita & Artikel Terbaru
            </h2>
            <p className="mt-2 max-w-2xl text-emerald-900/70">
              Ikuti update gerakan, kabar terbaru, dan artikel kajian yang baru
              dipublikasikan.
            </p>
          </div>

          <Link
            href="/berita"
            className="hidden items-center gap-1 text-sm font-semibold text-emerald-800 hover:text-emerald-900 sm:flex"
          >
            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-4 xl:grid xl:grid-cols-3 xl:gap-6 xl:space-y-0">
          {activeItems.length === 0 ? (
            <div className="col-span-full py-8 text-center text-emerald-900/65">
              Belum ada berita atau artikel yang dipublikasikan.
            </div>
          ) : (
            activeItems.map((item) => (
              <Link
                key={item.id}
                href={item.type === "berita" ? `/berita/${item.slug}` : `/artikel/${item.slug}`}
                className="group flex items-start gap-4 rounded-[22px] border border-emerald-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.06)] xl:h-full"
              >
                <div className="relative aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-[16px] bg-emerald-50">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-500">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex flex-1 self-stretch flex-col justify-between">
                  <div>
                    <h3 className="line-clamp-2 text-base font-bold leading-tight capitalize text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {truncateText(item.excerpt, 120)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(item.publishedAt)}</span>
                    <span>•</span>
                    <span>{item.readingTime}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/berita" className="text-sm font-medium text-primary hover:underline">
            Lihat Semua →
          </Link>
        </div>
      </div>
    </section>
  );
}
