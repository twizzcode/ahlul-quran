import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { article } from "@/src/db/schema";

const VIEW_COOKIE_TTL_SECONDS = 60 * 60 * 6;

function getViewCookieName(slug: string) {
  return `article_view_${slug.replace(/[^a-z0-9_-]/gi, "_")}`;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const viewCookieName = getViewCookieName(slug);
  const hasTrackedView = cookieStore.has(viewCookieName);

  const existing = await db.query.article.findFirst({
    where: eq(article.slug, slug),
    columns: {
      id: true,
      viewCount: true,
      status: true,
    },
  });

  if (!existing || existing.status !== "PUBLISHED") {
    return apiError("Artikel tidak ditemukan.", 404);
  }

  if (hasTrackedView) {
    return apiSuccess({ viewCount: existing.viewCount });
  }

  const [updated] = await db
    .update(article)
    .set({
      viewCount: sql`${article.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(article.id, existing.id))
    .returning({ viewCount: article.viewCount });

  cookieStore.set(viewCookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: VIEW_COOKIE_TTL_SECONDS,
    path: "/",
  });

  return apiSuccess({ viewCount: updated?.viewCount ?? existing.viewCount + 1 });
}
