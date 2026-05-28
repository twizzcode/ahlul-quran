"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DashboardArticleFiltersProps = {
  initialType: string;
  initialQuery: string;
};

export function DashboardArticleFilters({
  initialType,
  initialQuery,
}: DashboardArticleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [type, setType] = useState(initialType || "__all__");
  const [query, setQuery] = useState(initialQuery);

  function updateParams(nextType: string, nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextType && nextType !== "__all__") {
      params.set("type", nextType);
    } else {
      params.delete("type");
    }

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    const nextSearch = params.toString();
    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams(type, query);
  }

  return (
    <form className="mb-6 flex flex-wrap gap-3" onSubmit={handleSubmit}>
      <div className="w-52">
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
            updateParams(value, query);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Jenis</SelectItem>
            <SelectItem value="artikel">Artikel</SelectItem>
            <SelectItem value="berita">Berita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari artikel..."
        className="h-11 w-72"
      />
    </form>
  );
}
