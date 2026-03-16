import type { Metadata } from "next";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto kegiatan dan dokumentasi masjid",
};

export const dynamic = "force-dynamic";

export default async function GaleriPage() {
  const galleries = await prisma.gallery.findMany({
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {galleries.map((gallery) => {
            const image = gallery.images[0];

            if (!image) {
              return null;
            }

            return (
            <div
              key={gallery.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={image.url}
                alt={image.caption || gallery.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p className="line-clamp-1 text-sm font-medium">{gallery.title}</p>
                <p className="line-clamp-2 text-xs text-white/75">
                  {image.caption?.trim() || gallery.description?.trim() || "Dokumentasi kegiatan masjid"}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
