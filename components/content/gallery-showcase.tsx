"use client";

import Image from "next/image";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { CalendarDays, Images, Search, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type GalleryShowcaseItem = {
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

type GalleryShowcaseProps = {
  galleries: GalleryShowcaseItem[];
};

const GALLERIES_PER_PAGE = 20;

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages] as const;
}

export function GalleryShowcase({ galleries }: GalleryShowcaseProps) {
  const [selectedGallery, setSelectedGallery] = useState<GalleryShowcaseItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredGalleries = normalizedQuery
    ? galleries.filter((gallery) => {
        const searchableText = [
          gallery.title,
          gallery.description,
          ...gallery.images.map((image) => image.caption),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : galleries;
  const totalPages = Math.max(1, Math.ceil(filteredGalleries.length / GALLERIES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedGalleries = filteredGalleries.slice(
    (safeCurrentPage - 1) * GALLERIES_PER_PAGE,
    safeCurrentPage * GALLERIES_PER_PAGE
  );

  useEffect(() => {
    startTransition(() => {
      setCurrentPage(1);
    });
  }, [normalizedQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      startTransition(() => {
        setCurrentPage(totalPages);
      });
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedGallery]);

  const pageItems = buildPageItems(safeCurrentPage, totalPages);

  function goToPage(page: number) {
    startTransition(() => {
      setCurrentPage(page);
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-emerald-900/75">
            Menampilkan {filteredGalleries.length} dari {galleries.length} galeri.
          </p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700/60" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari galeri..."
            className="h-11 rounded-xl border-emerald-100 bg-white pl-10 pr-11 shadow-sm focus-visible:border-emerald-300 focus-visible:ring-emerald-100"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700/60 transition hover:text-emerald-900"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {normalizedQuery ? (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900/80">
          <span>
            Menampilkan {filteredGalleries.length} hasil untuk &quot;{deferredQuery.trim()}&quot;.
          </span>
          {filteredGalleries.length > 0 ? (
            <span className="text-emerald-700/70">{galleries.length} total galeri</span>
          ) : null}
        </div>
      ) : null}

      {filteredGalleries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-10 text-center">
          <p className="text-base font-medium text-emerald-950">Galeri tidak ditemukan.</p>
          <p className="mt-2 text-sm text-emerald-900/65">
            Coba gunakan kata kunci lain untuk menemukan dokumentasi yang dicari.
          </p>
        </div>
      ) : (
        <div id="gallery-grid" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paginatedGalleries.map((gallery) => {
            const coverImage = gallery.images[0];

            if (!coverImage) {
              return null;
            }

            return (
              <button
                key={gallery.id}
                type="button"
                onClick={() => setSelectedGallery(gallery)}
                className="group h-full overflow-hidden rounded-[24px] border border-emerald-100 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <article className="flex h-full flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
                    <Image
                      src={coverImage.url}
                      alt={coverImage.caption || gallery.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/55 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-emerald-950 backdrop-blur">
                      <Images className="h-3.5 w-3.5" />
                      <span>{gallery.images.length} foto</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-3 p-4 pt-3">
                    <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-semibold leading-7 tracking-tight text-emerald-950">
                      {gallery.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-emerald-800/80">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      <span className="truncate">{formatDate(gallery.createdAt)}</span>
                    </div>
                  </div>
                </article>
              </button>
            );
          })}
        </div>
      )}

      {filteredGalleries.length > 0 ? (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#gallery-grid"
                aria-disabled={safeCurrentPage === 1}
                className={safeCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                onClick={(event) => {
                  event.preventDefault();
                  if (safeCurrentPage > 1) {
                    goToPage(safeCurrentPage - 1);
                  }
                }}
              />
            </PaginationItem>

            {pageItems.map((item, index) => {
              if (typeof item !== "number") {
                return (
                  <PaginationItem key={`${item}-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#gallery-grid"
                    isActive={item === safeCurrentPage}
                    className="cursor-pointer rounded-xl border-emerald-100 data-[active=true]:border-emerald-900 data-[active=true]:bg-emerald-900 data-[active=true]:text-white"
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#gallery-grid"
                aria-disabled={safeCurrentPage === totalPages}
                className={safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                onClick={(event) => {
                  event.preventDefault();
                  if (safeCurrentPage < totalPages) {
                    goToPage(safeCurrentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <Dialog open={!!selectedGallery} onOpenChange={(open) => !open && setSelectedGallery(null)}>
        {selectedGallery ? (
          (() => {
            const activeImage = selectedGallery.images[selectedImageIndex] ?? selectedGallery.images[0];

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
                            "Dokumentasi kegiatan masjid."}
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
