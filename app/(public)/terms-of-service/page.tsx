import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Syarat penggunaan layanan Masjid Ahlul Qur'an.",
  path: "/terms-of-service",
});

const sections = [
  {
    title: "Penggunaan Layanan",
    body:
      "Website ini disediakan untuk informasi publik, akses akun jamaah, dan layanan pendukung seperti riwayat donasi. Dengan menggunakan layanan ini, Anda setuju untuk memakai akun dan fitur yang tersedia secara wajar, sah, dan tidak merugikan pihak lain.",
  },
  {
    title: "Akun Pengguna",
    body:
      "Anda bertanggung jawab menjaga kerahasiaan data login dan aktivitas pada akun Anda. Jika terdapat penggunaan tanpa izin atau indikasi penyalahgunaan, segera hubungi pengelola masjid agar tindakan pengamanan dapat dilakukan.",
  },
  {
    title: "Data dan Konten",
    body:
      "Informasi yang Anda kirimkan melalui website ini harus akurat dan tidak melanggar hukum. Pengelola berhak meninjau, memperbarui, atau menonaktifkan akses tertentu jika ditemukan pelanggaran, penyalahgunaan, atau risiko terhadap operasional layanan.",
  },
  {
    title: "Perubahan Layanan",
    body:
      "Fitur, konten, atau kebijakan dapat diperbarui sewaktu-waktu untuk menyesuaikan kebutuhan operasional, keamanan, atau kepatuhan. Perubahan penting akan berlaku setelah dipublikasikan pada website ini.",
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="bg-white pb-16 pt-[calc(var(--home-nav-height)+2rem)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm leading-7 text-emerald-900/75 sm:text-base">
            Dokumen ini menjelaskan ketentuan umum penggunaan website dan layanan akun
            Masjid Ahlul Qur&apos;an.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-emerald-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
