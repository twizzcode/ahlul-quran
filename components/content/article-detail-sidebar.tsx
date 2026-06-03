import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, truncateText } from "@/lib/utils";

type ArticleDetailSidebarItem = {
  id: string;
  title: string;
  href: string;
  categoryName: string | null;
  publishedAt: string;
};

type ArticleDetailSidebarProps = {
  masjidTitle: string;
  masjidSubtitle?: string;
  quickLinks: Array<{
    title: string;
    href: string;
    description: string;
  }>;
  relatedTitle: string;
  relatedHref: string;
  relatedHrefLabel: string;
  items: ArticleDetailSidebarItem[];
  donationCta?: {
    title: string;
    description: string;
    href: string;
    hrefLabel: string;
    progress?: number;
    collectedAmount?: number;
    targetAmount?: number;
  };
};

export function ArticleDetailSidebar({
  masjidTitle,
  masjidSubtitle,
  quickLinks,
  relatedTitle,
  relatedHref,
  relatedHrefLabel,
  items,
  donationCta,
}: ArticleDetailSidebarProps) {
  if (items.length === 0 && quickLinks.length === 0 && !donationCta) {
    return null;
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[calc(var(--home-nav-height)+3rem)]">
        <div className="space-y-6">
          <div className="pb-1">
            <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
              About Us
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-emerald-950">
              {masjidTitle}
            </h2>
            {masjidSubtitle ? (
              <p className="mt-2 text-sm leading-6 text-emerald-900/70">{masjidSubtitle}</p>
            ) : null}

            {quickLinks.length > 0 ? (
              <div className="mt-5 space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group block py-2 transition-all duration-200 hover:translate-x-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-emerald-900">
                          {link.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {link.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="h-px bg-emerald-100" />

          {items.length > 0 ? (
            <div>
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                {relatedTitle}
              </p>
              <Link
                href={relatedHref}
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950"
              >
                {relatedHrefLabel}
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
                  <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-6 capitalize text-slate-900 transition-colors group-hover:text-emerald-900">
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
        ) : null}

          {items.length > 0 && donationCta ? <div className="h-px bg-emerald-100" /> : null}

          {donationCta ? (
            <div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                  Campaign
                </p>
                <h3 className="mt-2 text-base font-semibold text-emerald-950">
                  {donationCta.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-emerald-900/75">
                  {donationCta.description}
                </p>
              </div>

            {typeof donationCta.progress === "number" ? (
              <div className="mt-5">
                <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${Math.min(100, Math.max(0, donationCta.progress))}%` }}
                  />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700/70">
                      Terkumpul
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-950">
                      {formatCurrency(donationCta.collectedAmount ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700/70">
                      Target
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-950">
                      {formatCurrency(donationCta.targetAmount ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <Link
              href={donationCta.href}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950"
            >
              {donationCta.hrefLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
        </div>
      </div>
    </aside>
  );
}
