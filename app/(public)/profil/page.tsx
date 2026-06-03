import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Building2, HandCoins, Landmark, Users } from "lucide-react";
import { CommitteeOrgChart } from "@/components/committee-org-chart";
import { PageIntro } from "@/components/content/page-intro";
import { Testimonial10 } from "@/components/testimonial10";
import Timeline from "@/components/timeline";
import { getMasjidProfileData } from "@/lib/masjid/masjid-profile.server";

export const metadata: Metadata = {
  title: "Profil Markas Dakwah",
  description:
    "Profil Masjid Ahlul Qur'an, arah gerak pembangunan markas dakwah, struktur panitia, dan tahapan gerakan.",
};

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const profile = await getMasjidProfileData();

  return (
    <div className="pb-16 pt-[calc(var(--home-nav-height)+1rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageIntro
          className="mb-6"
          title="Profil Markas Dakwah"
          description="Mengenal arah pembangunan Masjid Ahlul Qur'an, struktur gerakan, dan tahapan aktivasi markas dakwah."
          primaryAction={{ label: "Dukung Pembangunan", href: "/donasi" }}
        />

        <section id="latar-belakang" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Latar Belakang"
            title="Pendirian masjid diarahkan untuk menjawab kebutuhan umat yang lebih luas"
            description={profile.backgroundText}
          />

          <div className="mt-8 grid gap-y-2 md:grid-cols-3 md:gap-x-6">
            <InfoCard
              icon={<Landmark className="h-5 w-5" />}
              title="Masjid sebagai pusat peradaban"
              description="Bukan hanya ruang ibadah ritual, tetapi markas yang melahirkan pemikiran, pendidikan, dan gerakan sosial."
            />
            <InfoCard
              icon={<Users className="h-5 w-5" />}
              title="Menjawab kebutuhan generasi"
              description="Menyediakan ruang belajar, pembinaan, dan aktivitas positif bagi anak-anak, remaja, pemuda, dan keluarga."
            />
            <InfoCard
              icon={<Building2 className="h-5 w-5" />}
              title="Gerak yang berkelanjutan"
              description="Mempersiapkan markas dakwah yang hidup, aktif, dan dikelola secara terarah untuk jangka panjang."
            />
          </div>
        </section>

        <section id="visi-utama" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Visi Utama"
            title="Arah pembangunan Masjid Ahlul Qur'an"
            description={profile.visionStatement}
          />

          <Testimonial10
            className="mt-4 py-8"
            quote={profile.visionStatement}
            author={{
              name: profile.name,
              role: profile.movementName,
              avatar: {
                src: profile.logoUrl || "/logo.webp",
                alt: `${profile.name} logo`,
                className: "object-contain p-2",
              },
            }}
          />
        </section>

        <section id="pilar-gerakan" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Pilar Gerakan"
            title="Empat fungsi utama markas dakwah"
            description="Pilar ini menjadi dasar penyusunan program ibadah, dakwah, pendidikan, dan pemberdayaan sosial."
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

        <section id="tahapan-pendirian" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Tahapan Proses"
            title="Road to pembangunan dan aktivasi markas dakwah"
            description="Tahapan ini disusun untuk menjaga proses pembangunan berjalan legal, tertata, dan siap dioperasionalkan."
          />

          <div className="mt-8">
            <Timeline items={profile.timelineItems} />
          </div>
        </section>

        <section id="struktur-panitia" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Struktur Panitia"
            title="Struktur teknis dan tupoksi yang menopang pembangunan"
            description="Nama dan peran panitia ditampilkan untuk memperjelas akuntabilitas, koordinasi, dan arah kerja lapangan."
          />

          <div className="mt-8">
            <CommitteeOrgChart items={profile.committeeItems} />
          </div>
        </section>

        <section id="sumber-dana" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Sumber Dana"
            title="Model penggalangan yang dirancang untuk menopang gerakan"
            description="Strategi pendanaan dirancang agar pembangunan dan operasional awal tidak berhenti pada satu kanal saja."
          />

          <div className="mt-8 grid gap-y-2 md:grid-cols-3 md:gap-x-6">
            {profile.fundingItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="py-6 md:pr-6 md:[&:not(:last-child)]:border-r md:[&:not(:last-child)]:border-emerald-100"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                  <HandCoins className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-emerald-900/75">{item.description}</p>
              </article>
            ))}
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

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="py-6 md:pr-6 md:[&:not(:last-child)]:border-r md:[&:not(:last-child)]:border-emerald-100">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-emerald-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-emerald-900/75">{description}</p>
    </article>
  );
}
