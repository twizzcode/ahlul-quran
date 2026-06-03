"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

type ArticleViewCountProps = {
  slug: string;
  initialCount: number;
};

export function ArticleViewCount({
  slug,
  initialCount,
}: ArticleViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;

    async function trackView() {
      try {
        const response = await fetch(`/api/articles/${slug}/views`, {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as { success?: boolean; data?: { viewCount?: number } };
        if (!cancelled && result?.success && typeof result.data?.viewCount === "number") {
          setCount(result.data.viewCount);
        }
      } catch {
        // Ignore tracking failures and keep rendering the initial count.
      }
    }

    void trackView();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span className="flex items-center gap-2">
      <Eye className="h-4 w-4" />
      {count} kali dilihat
    </span>
  );
}
