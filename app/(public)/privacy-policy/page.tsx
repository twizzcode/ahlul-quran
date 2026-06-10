import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Kebijakan privasi penggunaan layanan Masjid Ahlul Qur'an.",
  path: "/privacy-policy",
});

const sections = [
  {
    title: "Informasi yang Dikumpulkan",
    body:
      "Kami dapat mengumpulkan informasi seperti nama, email, dan data akun yang diperlukan untuk proses login, pengelolaan sesi, serta penyajian fitur yang relevan dengan aktivitas pengguna di website.",
  },
  {
    title: "Penggunaan Informasi",
    body:
      "Informasi yang dikumpulkan digunakan untuk mengelola autentikasi akun, menampilkan riwayat aktivitas terkait layanan, menjaga keamanan sistem, serta meningkatkan kualitas pengalaman pengguna pada website.",
  },
  {
    title: "Penyimpanan dan Keamanan",
    body:
      "Kami berupaya melindungi data pengguna dengan kontrol akses, pengelolaan sesi, dan langkah teknis yang wajar. Meskipun demikian, tidak ada sistem digital yang sepenuhnya bebas risiko sehingga pengguna tetap disarankan menjaga kerahasiaan akun masing-masing.",
  },
  {
    title: "Hak Pengguna",
    body:
      "Pengguna dapat menghubungi pengelola masjid untuk pertanyaan terkait data pribadi, pembaruan informasi akun, atau permintaan bantuan apabila menemukan masalah yang berkaitan dengan privasi dan keamanan akun.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white pb-16 pt-[calc(var(--home-nav-height)+2rem)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-emerald-900/75 sm:text-base">
            Dokumen ini menjelaskan bagaimana data akun pengguna dipakai dan dijaga
            dalam layanan website Masjid Ahlul Qur&apos;an.
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
