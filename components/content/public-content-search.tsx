"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PublicContentSearchProps = {
  placeholder: string;
  initialQuery: string;
  initialSort?: "newest" | "oldest";
  summary?: string;
};

export function PublicContentSearch({
  placeholder,
  initialQuery,
  initialSort = "newest",
  summary,
}: PublicContentSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<"newest" | "oldest">(initialSort);
  const committedQueryRef = useRef(initialQuery.trim());
  const committedSortRef = useRef(initialSort);

  useEffect(() => {
    const normalized = query.trim();

    if (normalized === committedQueryRef.current && sort === committedSortRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (normalized) {
        params.set("q", normalized);
      } else {
        params.delete("q");
      }

      if (sort === "oldest") {
        params.set("sort", sort);
      } else {
        params.delete("sort");
      }

      params.delete("page");

      const nextQuery = params.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      committedQueryRef.current = normalized;
      committedSortRef.current = sort;
      router.replace(nextHref, { scroll: false });
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, query, router, sort]);

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        {summary ? <p className="text-sm text-emerald-900/75">{summary}</p> : null}
      </div>

      <div className="flex w-full gap-2 sm:w-auto">
        <div className="relative flex-1 sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="flex h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-emerald-100"
              aria-label="Urutkan konten"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-[240] min-w-[220px] rounded-2xl border-emerald-100 p-2"
          >
            <DropdownMenuCheckboxItem
              indicatorPosition="right"
              checked={sort === "oldest"}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSort("oldest");
                }
              }}
              className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
            >
              Dari yang terlama
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              indicatorPosition="right"
              checked={sort === "newest"}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSort("newest");
                }
              }}
              className="rounded-xl py-2.5 pr-8 pl-3 text-sm text-emerald-950"
            >
              Dari yang terbaru
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
