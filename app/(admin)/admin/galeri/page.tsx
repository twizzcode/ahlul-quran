import { DashboardGalleryManagement, type DashboardGalleryItem } from "@/components/dashboard/masjid/dashboard-gallery-management";
import { db } from "@/src";
import { gallery as galleryTable } from "@/src/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardGaleriPage() {
  const galleriesRaw = await db.query.gallery.findMany({
    with: {
      images: true,
      author: { columns: { name: true } },
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  const galleries: DashboardGalleryItem[] = galleriesRaw.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    description: gallery.description,
    createdAt: gallery.createdAt.toISOString(),
    updatedAt: gallery.updatedAt.toISOString(),
    authorName: gallery.author.name,
    imageCount: gallery.images.length,
    images: gallery.images.sort((a, b) => a.order - b.order).map((image) => ({
      id: image.id,
      url: image.url,
      caption: image.caption,
      order: image.order,
    })),
  }));

  void galleryTable;
  return <DashboardGalleryManagement initialGalleries={galleries} />;
}
