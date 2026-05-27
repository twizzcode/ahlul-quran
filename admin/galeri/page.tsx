import prisma from "@/lib/prisma";
import {
  DashboardGalleryManagement,
  type DashboardGalleryItem,
} from "@/components/dashboard-gallery-management";

export const dynamic = "force-dynamic";

export default async function DashboardGaleriPage() {
  const galleriesRaw = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      author: {
        select: { name: true },
      },
      _count: {
        select: { images: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const galleries: DashboardGalleryItem[] = galleriesRaw.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    description: gallery.description,
    createdAt: gallery.createdAt.toISOString(),
    updatedAt: gallery.updatedAt.toISOString(),
    authorName: gallery.author.name,
    imageCount: gallery._count.images,
    images: gallery.images.map((image) => ({
      id: image.id,
      url: image.url,
      caption: image.caption,
      order: image.order,
    })),
  }));

  return <DashboardGalleryManagement initialGalleries={galleries} />;
}
