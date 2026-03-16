import prisma from "@/lib/prisma"
import { deleteFromR2, extractKeyFromUrl, isManagedR2Url } from "@/lib/r2"

type ArticleAssetSource = {
  coverImage?: string | null
  content?: string | null
}

const IMAGE_SRC_REGEX = /<img[^>]+src=["']([^"'<>]+)["']/gi

export function extractImageUrlsFromHtml(html: string | null | undefined) {
  if (!html) {
    return []
  }

  const urls = new Set<string>()

  for (const match of html.matchAll(IMAGE_SRC_REGEX)) {
    const src = match[1]?.trim()
    if (src) {
      urls.add(src)
    }
  }

  return [...urls]
}

export function getManagedArticleAssetUrls(source: ArticleAssetSource) {
  const urls = new Set<string>()

  if (source.coverImage?.trim() && isManagedR2Url(source.coverImage)) {
    urls.add(source.coverImage.trim())
  }

  for (const url of extractImageUrlsFromHtml(source.content)) {
    if (isManagedR2Url(url)) {
      urls.add(url)
    }
  }

  return urls
}

export function getRemovedArticleAssetUrls(
  before: ArticleAssetSource,
  after: ArticleAssetSource,
) {
  const previousUrls = getManagedArticleAssetUrls(before)
  const nextUrls = getManagedArticleAssetUrls(after)

  return [...previousUrls].filter((url) => !nextUrls.has(url))
}

export async function deleteUnusedArticleAssets(
  urls: string[],
  excludeArticleId?: string,
) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))]

  for (const url of uniqueUrls) {
    const stillUsed = await prisma.article.findFirst({
      where: {
        ...(excludeArticleId
          ? {
              id: {
                not: excludeArticleId,
              },
            }
          : {}),
        OR: [
          { coverImage: url },
          { content: { contains: url } },
        ],
      },
      select: { id: true },
    })

    if (stillUsed) {
      continue
    }

    try {
      await deleteFromR2(extractKeyFromUrl(url))
    } catch (error) {
      console.error("Failed to delete unused article asset from R2:", {
        url,
        error,
      })
    }
  }
}
