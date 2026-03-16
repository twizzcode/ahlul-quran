import type { Metadata } from "next";
import {
  BookOpenCheck,
  HandHeart,
  HeartHandshake,
  Megaphone,
  MessagesSquare,
  Users,
} from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";

export const metadata: Metadata = {
  title: "Program",
  description: "Program ibadah, dakwah, pendidikan, dan pemberdayaan umat Masjid Ahlul Qur'an",
};

const programHighlights = [
  {
    title: "TPQ dan Halaqah Al-Qur'an",
    description:
      "Pembinaan dasar dan lanjutan Al-Qur'an untuk anak, remaja, dan jamaah umum sejak fase awal aktivasi markas dakwah.",
    icon: BookOpenCheck,
  },
  {
    title: "Kajian Islam Tematik",
    description:
      "Kajian rutin yang menguatkan ruhiyah, fikih keseharian, dan wawasan keislaman yang aplikatif bagi masyarakat.",
    icon: MessagesSquare,
  },
  {
    title: "Majelis Remaja dan Pemuda",
    description:
      "Ruang tumbuh generasi muda agar punya lingkungan belajar, mentoring, dan aktivitas positif yang sehat serta produktif.",
    icon: Users,
  },
  {
    title: "Pembinaan Keluarga Islami",
    description:
      "Program penguatan keluarga melalui majelis keluarga, edukasi pengasuhan, dan pembinaan nilai Islam dalam rumah tangga.",
    icon: HeartHandshake,
  },
  {
    title: "Bantuan Sosial Umat",
    description:
      "Distribusi bantuan sosial, santunan, dan aksi peduli lingkungan sebagai fungsi sosial masjid yang hidup sejak dini.",
    icon: HandHeart,
  },
  {
    title: "Publikasi dan Gerakan Dakwah",
    description:
      "Pamflet, baliho, dan kanal sosial media untuk memperluas ajakan kebaikan, komunikasi warga, dan dukungan umat.",
    icon: Megaphone,
  },
] as const;

export default async function KegiatanPage() {
  const profile = await getMasjidProfileData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-[calc(var(--home-nav-height)+1rem)] md:px-0">
      <PageIntro
        className="mb-10"
        title="Program Markas Dakwah"
        description="Program Masjid Ahlul Qur'an diarahkan menjadi pusat ibadah, dakwah, pendidikan, dan pemberdayaan umat sebagaimana arah gerak yang tertuang dalam proposal pembangunan."
      />

      <section className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Arah Program
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950">
            Empat poros gerak utama {profile.name}
          </h2>
          <p className="mt-4 text-base leading-8 text-emerald-900/70">
            Program utama mengikuti visi markas dakwah: menghadirkan pusat ibadah
            yang hidup, poros dakwah yang terarah, ruang tumbuh untuk generasi, dan
            lingkungan yang inklusif bagi masyarakat luas.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {profile.visionItems.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-900 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-emerald-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-900/75">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Aktivasi Awal
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950">
            Program yang disiapkan sejak fase pembangunan
          </h2>
          <p className="mt-4 text-base leading-8 text-emerald-900/70">
            Berdasarkan proposal, fungsi masjid tidak menunggu bangunan selesai total.
            Aktivasi SDM, dakwah, sosial, dan komunikasi umat sudah disiapkan dari
            awal agar markas ini lahir dengan gerak yang hidup.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {programHighlights.map((program) => {
            const Icon = program.icon;

            return (
              <article
                key={program.title}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-900 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">
                  {program.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-emerald-900/75">
                  {program.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Penggerak Program
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950">
            Tim yang menyiapkan aktivasi dakwah dan sosial
          </h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5">
              <h3 className="text-lg font-semibold text-emerald-950">
                Seksi Dakwah & Sosial
              </h3>
              <p className="mt-2 text-sm leading-7 text-emerald-900/75">
                Merancang TPQ, kajian, majelis remaja, menyiapkan SDM dakwah, dan
                membangun fungsi sosial masjid sejak dini.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5">
              <h3 className="text-lg font-semibold text-emerald-950">
                Seksi PR / Humas
              </h3>
              <p className="mt-2 text-sm leading-7 text-emerald-900/75">
                Membangun komunikasi dengan warga, membuat media publikasi, dan
                menjaga narasi gerakan selama proses pembangunan berlangsung.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-emerald-100 bg-emerald-950 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Karakter Program
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Bukan sekadar jadwal acara
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-emerald-50/80">
            <p>
              Program Masjid Ahlul Qur&apos;an dirancang untuk melahirkan pembinaan
              ruhiyah, intelektual, dan sosial keumatan secara berkelanjutan.
            </p>
            <p>
              Karena itu, halaman ini tidak lagi memakai format daftar event dummy,
              tetapi menampilkan arah program inti yang memang disebutkan dalam
              proposal pembangunan markas dakwah.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
