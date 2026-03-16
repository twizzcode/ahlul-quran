import { Button } from "@/components/ui/button";

// ============================================================
// Dashboard: Galeri Management
// ============================================================

export default function DashboardGaleriPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Galeri Foto</h1>
          <p className="text-sm text-muted-foreground">
            Kelola album dan foto kegiatan masjid
          </p>
        </div>
        <Button>+ Buat Album</Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-3 rounded-xl border p-8 text-center text-muted-foreground">
          Belum ada album foto. Klik &quot;Buat Album&quot; untuk membuat album baru. 
          File gambar akan disimpan di Cloudflare R2.
        </div>
      </div>
    </div>
  );
}
