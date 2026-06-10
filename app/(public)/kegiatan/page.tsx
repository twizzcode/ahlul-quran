import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Kegiatan",
  description: "Halaman kegiatan diarahkan ke halaman program Masjid Semilyar Tangan.",
  path: "/kegiatan",
  robots: {
    index: false,
    follow: false,
  },
});

export default function KegiatanPage() {
  redirect("/program");
}
