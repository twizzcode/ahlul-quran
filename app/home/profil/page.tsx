import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  HandCoins,
  Landmark,
  MapPinned,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMasjidProfileData } from "@/lib/masjid-profile.server";

export const metadata: Metadata = {
  title: "Profil Markas Dakwah",
  description:
    "Profil Masjid Ahlul Qur'an, arah gerak pembangunan markas dakwah, struktur panitia, dan roadmap gerakan.",
};

export const dynamic = "force-dynamic";

const sectionLinks = [
  { id: "latar-belakang", label: "Latar Belakang" },
  { id: "visi-utama", label: "Visi Utama" },
  { id: "pilar-gerakan", label: "Pilar Utama" },
  { id: "tahapan-pendirian", label: "Tahapan" },
  { id: "struktur-panitia", label: "Struktur Panitia" },
  { id: "sumber-dana", label: "Sumber Dana" },
  { id: "roadmap-markas", label: "Roadmap" },
];

export default async function ProfilPage() {
  const profile = await getMasjidProfileData();

  return (
    <div className="pb-16 pt-[calc(var(--home-nav-height)+1rem)]">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          <Image
            src={profile.bannerUrl || "/Gambar-masjid.png"}
            alt={profile.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-emerald-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(110,231,183,0.18),transparent_38%)]" />
        </div>

        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {profile.foundationName}
              </span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {profile.movementName}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full bg-white px-7 text-emerald-950 hover:bg-emerald-50" asChild>
                <Link href="/donasi">
                  <HandCoins className="mr-2 h-4 w-4" />
                  Dukung Pembangunan
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href="#roadmap-markas">
                  Lihat Roadmap
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-emerald-100">Brand Utama</p>
              <p className="mt-2 text-xl font-semibold text-white">{profile.name}</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                Markas dakwah yang disiapkan sebagai pusat ibadah, pendidikan, dan pemberdayaan umat.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-emerald-100">Gerakan</p>
              <p className="mt-2 text-xl font-semibold text-white">{profile.movementName}</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                Ajakan kolektif untuk mempertemukan dukungan umat, relasi sosial, dan pembangunan jangka panjang.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-emerald-100">Lembaga Penggerak</p>
              <p className="mt-2 text-xl font-semibold text-white">{profile.foundationName}</p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                Yayasan yang menyiapkan struktur gerakan, pengelolaan, dan kesinambungan program dakwah.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {sectionLinks.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-50"
              >
                {section.label}
              </a>
            ))}
          </div>
        </div>

        <section
          id="latar-belakang"
          className="scroll-mt-28 border-b border-emerald-100 py-14"
        >
          <SectionHeading
            eyebrow="Latar Belakang"
            title="Pendirian masjid diarahkan untuk menjawab kebutuhan umat yang lebih luas"
            description={profile.backgroundText}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
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

        <section id="visi-utama" className="scroll-mt-28 border-b border-emerald-100 py-14">
          <SectionHeading
            eyebrow="Visi Utama"
            title="Arah pembangunan Masjid Ahlul Qur'an"
            description={profile.visionStatement}
          />

          <div className="mt-8 rounded-3xl bg-emerald-950 p-8 text-white">
            <p className="max-w-4xl text-xl leading-8 text-emerald-50 sm:text-2xl">
              &ldquo;{profile.visionStatement}&rdquo;
            </p>
          </div>
        </section>

        <section id="pilar-gerakan" className="scroll-mt-28 border-b border-emerald-100 py-14">
          <SectionHeading
            eyebrow="Pilar Gerakan"
            title="Empat fungsi utama markas dakwah"
            description="Pilar ini menjadi dasar penyusunan program ibadah, dakwah, pendidikan, dan pemberdayaan sosial."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {profile.visionItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-emerald-950">{item.title}</h3>
                <p className="mt-3 leading-7 text-emerald-900/75">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="tahapan-pendirian"
          className="scroll-mt-28 border-b border-emerald-100 py-14"
        >
          <SectionHeading
            eyebrow="Tahapan Proses"
            title="Road to pembangunan dan aktivasi markas dakwah"
            description="Tahapan ini disusun untuk menjaga proses pembangunan berjalan legal, tertata, dan siap dioperasionalkan."
          />

          <div className="mt-8 space-y-4">
            {profile.timelineItems.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="grid gap-4 rounded-3xl border border-emerald-100 bg-white p-6 md:grid-cols-[220px_1fr]"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {item.period}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-emerald-200">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-emerald-950">{item.title}</h3>
                  <p className="mt-3 leading-7 text-emerald-900/75">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="struktur-panitia"
          className="scroll-mt-28 border-b border-emerald-100 py-14"
        >
          <SectionHeading
            eyebrow="Struktur Panitia"
            title="Struktur teknis dan tupoksi yang menopang pembangunan"
            description="Nama dan peran panitia ditampilkan untuk memperjelas akuntabilitas, koordinasi, dan arah kerja lapangan."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {profile.committeeItems.map((item, index) => (
              <article
                key={`${item.section}-${index}`}
                className="rounded-3xl border border-emerald-100 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {item.section}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                      {item.leads}
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Tim {index + 1}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <div key={`${item.section}-${bulletIndex}`} className="flex gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <p className="leading-7 text-emerald-900/75">{bullet}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="sumber-dana" className="scroll-mt-28 border-b border-emerald-100 py-14">
          <SectionHeading
            eyebrow="Sumber Dana"
            title="Model penggalangan yang dirancang untuk menopang gerakan"
            description="Strategi pendanaan dirancang agar pembangunan dan operasional awal tidak berhenti pada satu kanal saja."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {profile.fundingItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-900 shadow-sm">
                  <HandCoins className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">{item.title}</h3>
                <p className="mt-3 leading-7 text-emerald-900/75">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap-markas" className="scroll-mt-28 py-14">
          <SectionHeading
            eyebrow="Rencana Implementasi"
            title="Roadmap pembangunan markas dakwah"
            description="Roadmap ini menempatkan pembangunan fisik dan kesiapan operasional sebagai satu tarikan gerak yang sama."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {profile.roadmapItems.map((item, index) => (
              <article
                key={`${item.phase}-${index}`}
                className="rounded-3xl border border-emerald-100 bg-white p-6"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {item.phase}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-emerald-950">{item.title}</h3>
                <p className="mt-4 leading-7 text-emerald-900/75">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Aksi Nyata
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  Ambil bagian dalam pembangunan {profile.name}
                </h2>
                <p className="mt-3 text-base leading-7 text-emerald-50/80">
                  Dukungan publik, donatur, dan jejaring sosial menjadi energi utama untuk
                  mewujudkan markas dakwah yang aktif dan bermanfaat luas.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full bg-white px-7 text-emerald-950 hover:bg-emerald-50" asChild>
                  <Link href="/donasi">Donasi Sekarang</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <a href="#struktur-panitia">Lihat Struktur Panitia</a>
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <ContactCard
                icon={<MapPinned className="h-5 w-5" />}
                title="Alamat"
                value={profile.address || "Alamat markas dapat diisi melalui dashboard admin."}
              />
              <ContactCard
                icon={<Building2 className="h-5 w-5" />}
                title="Kontak"
                value={profile.phone || profile.email || "Kontak resmi belum diisi."}
              />
              <ContactCard
                icon={<HandCoins className="h-5 w-5" />}
                title="Donasi"
                value={
                  profile.bankName && profile.bankAccount
                    ? `${profile.bankName} • ${profile.bankAccount}${
                        profile.bankHolder ? ` • ${profile.bankHolder}` : ""
                      }`
                    : "Informasi rekening donasi belum diisi."
                }
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
    <article className="rounded-3xl border border-emerald-100 bg-white p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-emerald-950">{title}</h3>
      <p className="mt-3 leading-7 text-emerald-900/75">{description}</p>
    </article>
  );
}

function ContactCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-emerald-100">{title}</p>
      <p className="mt-2 text-sm leading-7 text-emerald-50/80">{value}</p>
    </div>
  );
}
