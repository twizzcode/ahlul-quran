import type { Metadata } from "next";
import dbQuery from "@/lib/data/db-query";
import { GalleryShowcase } from "@/components/content/gallery-showcase";
import { PageIntro } from "@/components/content/page-intro";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Galeri",
  description: "Galeri foto kegiatan dan dokumentasi masjid",
  path: "/galeri",
});

export const dynamic = "force-dynamic";

export default async function GaleriPage() {
  const galleries = await dbQuery.gallery.findMany({
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-[calc(var(--home-nav-height)+1rem)] sm:px-6 lg:px-8">
        <PageIntro
          className="mb-8"
          title="Galeri Foto"
          description="Dokumentasi kegiatan dan momen-momen indah di masjid kami."
        />

        {galleries.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-base font-medium">Galeri belum tersedia.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Dokumentasi kegiatan akan tampil di sini setelah foto galeri ditambahkan dari panel admin.
            </p>
          </div>
        ) : (
          <GalleryShowcase
            galleries={galleries.map((gallery) => ({
              id: gallery.id,
              title: gallery.title,
              description: gallery.description,
              createdAt: gallery.createdAt.toISOString(),
              images: gallery.images.map((image) => ({
                id: image.id,
                url: image.url,
                caption: image.caption,
              })),
            }))}
          />
        )}
    </div>
  );
}
