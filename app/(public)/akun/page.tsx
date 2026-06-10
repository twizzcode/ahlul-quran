import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Akun",
  description: "Halaman akun pengguna pada website Masjid Semilyar Tangan.",
  path: "/akun",
  robots: {
    index: false,
    follow: false,
  },
});

export const dynamic = "force-dynamic";

export default function AccountPage() {
  redirect("/");
}
