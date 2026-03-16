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
  const placeholderCount = Math.max(0, MAX_ITEMS - activeItems.length);

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
            <>
              <div className="col-span-full rounded-2xl bg-emerald-50/45 p-8 text-center text-emerald-900/65">
                Belum ada berita atau artikel yang dipublikasikan.
              </div>

              {Array.from({ length: MAX_ITEMS - 1 }, (_, index) => (
                <div
                  key={`empty-${index}`}
                  aria-hidden="true"
                  className="hidden overflow-hidden rounded-xl border border-dashed border-emerald-200 bg-emerald-50/35 xl:block"
                >
                  <div className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(209,250,229,0.8)_100%)]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-24 rounded-full bg-emerald-100/90" />
                    <div className="h-5 w-full rounded-full bg-emerald-100/90" />
                    <div className="h-5 w-4/5 rounded-full bg-emerald-100/80" />
                    <div className="pt-3">
                      <div className="h-3 w-20 rounded-full bg-emerald-100/75" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {activeItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.type === "berita" ? `/berita/${item.slug}` : `/artikel/${item.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-emerald-100/70 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:gap-4 sm:p-4 xl:h-full xl:flex-col"
                >
                  <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-emerald-50 sm:w-40 xl:w-full">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-500">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex flex-1 self-stretch flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug capitalize transition-colors group-hover:text-primary sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="hidden xl:mt-3 xl:line-clamp-2 xl:text-sm xl:leading-6 xl:text-muted-foreground">
                        {truncateText(item.excerpt, 120)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                      <span>{formatDate(item.publishedAt)}</span>
                      <span>•</span>
                      <span>{item.readingTime}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {Array.from({ length: placeholderCount }, (_, index) => (
                <div
                  key={`placeholder-${index}`}
                  aria-hidden="true"
                  className="hidden overflow-hidden rounded-xl border border-dashed border-emerald-200 bg-emerald-50/35 xl:block"
                >
                  <div className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(255,255,255,0.7)_0%,rgba(209,250,229,0.8)_100%)]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-full rounded-full bg-emerald-100/90" />
                    <div className="h-5 w-4/5 rounded-full bg-emerald-100/80" />
                    <div className="pt-2">
                      <div className="h-3 w-20 rounded-full bg-emerald-100/75" />
                    </div>
                  </div>
                </div>
              ))}
            </>
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
