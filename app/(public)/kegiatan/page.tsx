import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  BookOpenCheck,
  HandHeart,
  HeartHandshake,
  Megaphone,
  MessagesSquare,
  Users,
} from "lucide-react";
import { PageIntro } from "@/components/content/page-intro";
import { Testimonial10 } from "@/components/testimonial10";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";

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

const activationTeams = [
  {
    title: "Seksi Dakwah & Sosial",
    description:
      "Merancang TPQ, kajian, majelis remaja, menyiapkan SDM dakwah, dan membangun fungsi sosial masjid sejak dini.",
  },
  {
    title: "Seksi PR / Humas",
    description:
      "Membangun komunikasi dengan warga, membuat media publikasi, dan menjaga narasi gerakan selama proses pembangunan berlangsung.",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function KegiatanPage() {
  const profile = await getMasjidProfileData();

  return (
    <div className="pb-16 pt-[calc(var(--home-nav-height)+1rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageIntro
          className="mb-6"
          title="Program Markas Dakwah"
          description="Program Masjid Ahlul Qur'an diarahkan menjadi pusat ibadah, dakwah, pendidikan, dan pemberdayaan umat sebagaimana arah gerak yang tertuang dalam proposal pembangunan."
        />

        <section id="arah-program" className="scroll-mt-28 border-b border-emerald-100 py-14">
          <SectionHeading
            eyebrow="Arah Program"
            title={`Empat poros gerak utama ${profile.name}`}
            description="Program utama mengikuti visi markas dakwah: menghadirkan pusat ibadah yang hidup, poros dakwah yang terarah, ruang tumbuh untuk generasi, dan lingkungan yang inklusif bagi masyarakat luas."
          />

          <div className="mt-8 grid gap-y-2 sm:grid-cols-2 sm:gap-x-6 xl:grid-cols-4">
            {profile.visionItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="py-6 sm:pr-6 sm:[&:not(:nth-child(2n))]:border-r sm:[&:not(:nth-child(2n))]:border-emerald-100 xl:[&:not(:nth-child(2n))]:border-r-0 xl:[&:not(:nth-child(4n))]:border-r xl:[&:not(:nth-child(4n))]:border-emerald-100 xl:pr-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-800">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-emerald-900/75">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="aktivasi-awal" className="scroll-mt-28 border-b border-emerald-100 py-14">
          <SectionHeading
            eyebrow="Aktivasi Awal"
            title="Program yang disiapkan sejak fase pembangunan"
            description="Berdasarkan proposal, fungsi masjid tidak menunggu bangunan selesai total. Aktivasi SDM, dakwah, sosial, dan komunikasi umat sudah disiapkan dari awal agar markas ini lahir dengan gerak yang hidup."
          />

          <div className="mt-8 grid gap-y-2 md:grid-cols-2 md:gap-x-6 xl:grid-cols-3">
            {programHighlights.map((program, index) => {
              const Icon = program.icon;

              return (
                <ProgramCard
                  key={program.title}
                  icon={<Icon className="h-5 w-5" />}
                  title={program.title}
                  description={program.description}
                  isLastColumn={(index + 1) % 3 === 0}
                />
              );
            })}
          </div>
        </section>

        <section id="penggerak-program" className="scroll-mt-28 border-b border-emerald-100 py-14">
          <SectionHeading
            eyebrow="Penggerak Program"
            title="Tim yang menyiapkan aktivasi dakwah dan sosial"
            description="Gerak program disiapkan oleh tim yang fokus pada pembinaan, layanan sosial, dan komunikasi publik agar masjid lahir dengan ritme yang hidup sejak awal."
          />

          <div className="mt-8 grid gap-y-2 lg:grid-cols-[1.1fr_0.9fr] lg:gap-x-10">
            <div className="grid gap-y-2">
              {activationTeams.map((team, index) => (
                <article
                  key={team.title}
                  className={`py-6 ${index === 0 ? "border-b border-emerald-100" : ""}`}
                >
                  <h3 className="text-xl font-semibold text-emerald-950">{team.title}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-900/75">
                    {team.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="py-6">
              <Testimonial10
                className="px-0 py-6 text-emerald-950"
                quote="Program Masjid Ahlul Qur'an dirancang bukan sekadar menjadi jadwal acara, tetapi menghadirkan pembinaan ruhiyah, intelektual, dan sosial keumatan secara berkelanjutan."
                hideAuthor
                author={{
                  name: "Bukan sekadar jadwal acara",
                  role: "Arah program inti markas dakwah",
                  avatar: {
                    src: profile.logoUrl || "/logo.webp",
                    alt: `${profile.name} logo`,
                    className: "object-contain p-2",
                  },
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-emerald-900/70">{description}</p>
    </div>
  );
}

function ProgramCard({
  icon,
  title,
  description,
  isLastColumn,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  isLastColumn: boolean;
}) {
  return (
    <article
      className={`py-6 md:pr-6 ${isLastColumn ? "" : "xl:border-r xl:border-emerald-100"} md:[&:not(:nth-child(2n))]:border-r md:[&:not(:nth-child(2n))]:border-emerald-100 xl:[&:not(:nth-child(2n))]:border-r-0`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-emerald-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-emerald-900/75">{description}</p>
    </article>
  );
}
