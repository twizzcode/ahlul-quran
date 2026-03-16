import prisma from "@/lib/prisma";
import { deleteFromR2, extractKeyFromUrl, isManagedR2Url } from "@/lib/r2";

type GalleryImageSource = {
  images: Array<{
    url: string;
  }>;
};

export function getManagedGalleryAssetUrls(source: GalleryImageSource) {
  return source.images
    .map((image) => image.url)
    .filter((url) => typeof url === "string" && isManagedR2Url(url));
}

export function getRemovedGalleryAssetUrls(
  previous: GalleryImageSource,
  next: GalleryImageSource
) {
  const previousUrls = new Set(getManagedGalleryAssetUrls(previous));
  const nextUrls = new Set(getManagedGalleryAssetUrls(next));

  return [...previousUrls].filter((url) => !nextUrls.has(url));
}

export async function deleteUnusedGalleryAssets(
  urls: string[],
  currentGalleryId?: string
) {
  if (urls.length === 0) {
    return;
  }

  for (const url of urls) {
    const usageCount = await prisma.galleryImage.count({
      where: {
        url,
        ...(currentGalleryId ? { galleryId: { not: currentGalleryId } } : {}),
      },
    });

    if (usageCount > 0) {
      continue;
    }

    try {
      await deleteFromR2(extractKeyFromUrl(url));
    } catch (error) {
      console.error("Failed to delete gallery asset from R2:", url, error);
    }
  }
}
