import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, truncateText } from "@/lib/utils";

type ArticleDetailSidebarItem = {
  id: string;
  title: string;
  href: string;
  categoryName: string | null;
  publishedAt: string;
};

type ArticleDetailSidebarProps = {
  title: string;
  href: string;
  hrefLabel: string;
  items: ArticleDetailSidebarItem[];
};

export function ArticleDetailSidebar({
  title,
  href,
  hrefLabel,
  items,
}: ArticleDetailSidebarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[calc(var(--home-nav-height)+1.5rem)] space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Rekomendasi
          </p>
          <h2 className="mt-2 text-xl font-semibold text-emerald-950">{title}</h2>
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-emerald-100/90">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block py-4 transition-all duration-200 hover:translate-x-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                {item.categoryName ?? "Publikasi"}
              </p>
              <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-900 transition-colors group-hover:text-emerald-900">
                {truncateText(item.title, 84)}
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-xs text-slate-500">{formatDate(item.publishedAt)}</p>
                <span className="h-px flex-1 bg-emerald-100 transition-colors group-hover:bg-emerald-200" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
