"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

type LinkedGalleryViewerItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  images: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;
};

type LinkedGalleryViewerProps = {
  galleries: LinkedGalleryViewerItem[];
};

export function LinkedGalleryViewer({ galleries }: LinkedGalleryViewerProps) {
  const [selectedGallery, setSelectedGallery] = useState<LinkedGalleryViewerItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedGallery]);

  return (
    <>
      <section className="mt-2 border-t border-emerald-100 py-5">
        <h2 className="text-2xl font-semibold text-emerald-950">Galeri Terkait</h2>

        {galleries.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">Belum ada galeri yang ditautkan ke kampanye ini.</div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {galleries.map((gallery) => {
              const coverImage = gallery.images[0];

              return (
                <button
                  key={gallery.id}
                  type="button"
                  onClick={() => setSelectedGallery(gallery)}
                  className="overflow-hidden rounded-2xl border border-emerald-100 bg-white text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
                    {coverImage ? (
                      <Image
                        src={coverImage.url}
                        alt={coverImage.caption || gallery.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-emerald-950">{gallery.title}</h3>
                    <p className="text-sm text-slate-500">
                      {formatDate(gallery.createdAt)} • {gallery.images.length} foto
                    </p>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-700">
                      {gallery.description?.trim() ||
                        coverImage?.caption?.trim() ||
                        "Dokumentasi terkait kampanye ini."}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!selectedGallery} onOpenChange={(open) => !open && setSelectedGallery(null)}>
        {selectedGallery ? (
          (() => {
            const activeImage = selectedGallery.images[selectedImageIndex] ?? selectedGallery.images[0];

            if (!activeImage) {
              return null;
            }

            return (
              <DialogContent
                overlayClassName="bg-emerald-950/30 backdrop-blur-sm"
                className="scrollbar-hidden max-h-[90vh] overflow-y-auto rounded-[32px] border-emerald-100 bg-white p-0 sm:max-w-6xl"
              >
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_360px]">
                  <div className="flex min-h-[420px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(167,243,208,0.45),_transparent_32%),linear-gradient(180deg,_rgba(236,253,245,0.9),_rgba(209,250,229,0.62))] p-4 sm:p-5 lg:min-h-[680px]">
                    <div className="relative flex h-full max-h-[76vh] w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/70 bg-white/55 p-2 sm:p-3 shadow-[0_22px_60px_rgba(6,78,59,0.14)] backdrop-blur">
                      <Image
                        src={activeImage.url}
                        alt={activeImage.caption || `${selectedGallery.title} ${selectedImageIndex + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <div className="scrollbar-hidden flex max-h-[90vh] flex-col overflow-y-auto border-t border-emerald-100 bg-white lg:border-l lg:border-t-0">
                    <div className="space-y-5 p-6 sm:p-8">
                      <DialogHeader className="space-y-3 text-left">
                        <DialogTitle className="text-2xl font-semibold tracking-tight text-emerald-950">
                          {selectedGallery.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2 text-sm text-emerald-800/80">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(selectedGallery.createdAt)}</span>
                        </div>
                        <DialogDescription className="text-sm leading-7 text-emerald-900/75">
                          {activeImage.caption?.trim() ||
                            selectedGallery.description?.trim() ||
                            "Dokumentasi terkait kampanye ini."}
                        </DialogDescription>
                      </DialogHeader>
                    </div>

                    <div className="grid grid-cols-3 gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
                      {selectedGallery.images.map((image, index) => {
                        const isActive = index === selectedImageIndex;

                        return (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={
                              isActive
                                ? "overflow-hidden rounded-2xl border-2 border-emerald-700 bg-emerald-50 text-left shadow-sm transition"
                                : "overflow-hidden rounded-2xl border border-emerald-100 bg-white text-left transition hover:border-emerald-300 hover:bg-emerald-50/70"
                            }
                          >
                            <div className="relative aspect-square bg-emerald-50">
                              <Image
                                src={image.url}
                                alt={image.caption || `${selectedGallery.title} ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </DialogContent>
            );
          })()
        ) : null}
      </Dialog>
    </>
  );
}
