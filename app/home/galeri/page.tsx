import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto kegiatan dan dokumentasi masjid",
};

// ============================================================
// Gallery Page - masjidcontoh.com/galeri
// ============================================================

export default function GaleriPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-0 pb-12 pt-[calc(var(--home-nav-height)+1rem)]">
      <PageIntro
        className="mb-8"
        title="Galeri Foto"
        description="Dokumentasi kegiatan dan momen-momen indah di masjid kami."
      />

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="group relative aspect-square rounded-xl bg-muted overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Foto {i + 1}
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <div className="text-white">
                <p className="text-sm font-medium">Album Kegiatan</p>
                <p className="text-xs text-white/70">Keterangan foto</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <button className="inline-flex items-center justify-center rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted">
          Muat Lebih Banyak
        </button>
      </div>
    </div>
  );
}
