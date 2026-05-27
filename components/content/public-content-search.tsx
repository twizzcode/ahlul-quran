"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type PublicContentSearchProps = {
  placeholder: string;
  initialQuery: string;
};

export function PublicContentSearch({
  placeholder,
  initialQuery,
}: PublicContentSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const committedQueryRef = useRef(initialQuery.trim());

  useEffect(() => {
    const normalized = query.trim();

    if (normalized === committedQueryRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (normalized) {
        params.set("q", normalized);
      } else {
        params.delete("q");
      }

      params.delete("page");

      const nextQuery = params.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      committedQueryRef.current = normalized;
      router.replace(nextHref, { scroll: false });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, query, router]);

  return (
    <div className="relative mb-8">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
      />
    </div>
  );
}
