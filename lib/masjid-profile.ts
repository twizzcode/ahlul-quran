import type { Prisma } from "@/lib/generated/prisma/client";

export type VisionItem = {
  title: string;
  description: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
};

export type CommitteeItem = {
  section: string;
  leads: string;
  bullets: string[];
};

export type FundingItem = {
  title: string;
  description: string;
};

export type RoadmapItem = {
  phase: string;
  title: string;
  description: string;
};

export type MasjidProfileData = {
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string;
  bannerUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  foundationName: string;
  movementName: string;
  heroTitle: string;
  heroSubtitle: string;
  backgroundText: string;
  visionStatement: string;
  visionItems: VisionItem[];
  timelineItems: TimelineItem[];
  committeeItems: CommitteeItem[];
  fundingItems: FundingItem[];
  roadmapItems: RoadmapItem[];
};

type JsonRecord = Record<string, Prisma.JsonValue>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === "string");
}

function parseVisionItem(value: unknown): VisionItem | null {
  if (!isJsonRecord(value)) return null;
  const title = value.title;
  const description = value.description;

  if (typeof title !== "string" || typeof description !== "string") {
    return null;
  }

  return { title, description };
}

function parseTimelineItem(value: unknown): TimelineItem | null {
  if (!isJsonRecord(value)) return null;
  const period = value.period;
  const title = value.title;
  const description = value.description;

  if (
    typeof period !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string"
  ) {
    return null;
  }

  return { period, title, description };
}

function parseCommitteeItem(value: unknown): CommitteeItem | null {
  if (!isJsonRecord(value)) return null;
  const section = value.section;
  const leads = value.leads;
  const bullets = readStringArray(value.bullets);

  if (
    typeof section !== "string" ||
    typeof leads !== "string" ||
    bullets === null
  ) {
    return null;
  }

  return { section, leads, bullets };
}

function parseFundingItem(value: unknown): FundingItem | null {
  if (!isJsonRecord(value)) return null;
  const title = value.title;
  const description = value.description;

  if (typeof title !== "string" || typeof description !== "string") {
    return null;
  }

  return { title, description };
}

function parseRoadmapItem(value: unknown): RoadmapItem | null {
  if (!isJsonRecord(value)) return null;
  const phase = value.phase;
  const title = value.title;
  const description = value.description;

  if (
    typeof phase !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string"
  ) {
    return null;
  }

  return { phase, title, description };
}

function parseTypedArray<T>(
  value: unknown,
  fallback: T[],
  parseItem: (item: unknown) => T | null
) {
  if (value === null || typeof value === "undefined") {
    return fallback;
  }

  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map(parseItem)
    .filter((item): item is T => item !== null);
}

export const DEFAULT_MASJID_PROFILE: MasjidProfileData = {
  name: "Masjid Ahlul Qur'an",
  description:
    "Masjid Ahlul Qur'an hadir sebagai pusat ibadah, pendidikan, dan pemberdayaan umat yang dibangun untuk menjadi markas dakwah yang hidup, inklusif, dan berkelanjutan.",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
  email: "",
  website: "",
  latitude: null,
  longitude: null,
  logoUrl: "",
  bannerUrl: "",
  facebook: "",
  instagram: "",
  youtube: "",
  tiktok: "",
  bankName: "",
  bankAccount: "",
  bankHolder: "",
  foundationName: "Yayasan Ahlul Qur'an Cinta Indonesia",
  movementName: "Gerakan Semilyar Tangan",
  heroTitle: "Pembangunan Masjid Ahlul Qur'an",
  heroSubtitle:
    "Markas dakwah yang diproyeksikan menjadi pusat peribadatan, pendidikan, dan pemberdayaan umat melalui gerakan kolektif yang terarah dan berkelanjutan.",
  backgroundText:
    "Masjid bukan hanya tempat ibadah ritual, tetapi pusat peradaban Islam yang melahirkan pemikiran, pendidikan, dan gerakan sosial keumatan. Kehadiran Masjid Ahlul Qur'an diarahkan untuk menjawab kebutuhan masyarakat modern akan ruang shalat berjamaah, pembinaan generasi muda, penguatan keluarga, serta aktivitas sosial yang sehat dan produktif.",
  visionStatement:
    "Menjadikan masjid sebagai pusat peribadatan, pendidikan, dan pemberdayaan umat berbasis dakwah yang inklusif, terarah, dan berkelanjutan.",
  visionItems: [
    {
      title: "Pusat Ibadah",
      description:
        "Menghidupkan shalat berjamaah lima waktu, pengajian, qiyamul lail, dan aktivitas ibadah lainnya secara rutin.",
    },
    {
      title: "Markas Dakwah",
      description:
        "Menyelenggarakan kajian Islam tematik, halaqah Al-Qur'an, pelatihan dai muda, dan pembinaan keluarga Islami.",
    },
    {
      title: "Ruang Tumbuh",
      description:
        "Menjadi rumah belajar bagi anak-anak, remaja, pemuda, dan keluarga, sekaligus tempat aksi sosial keumatan.",
    },
    {
      title: "Inklusif",
      description:
        "Menerima siapa pun yang ingin belajar, berkegiatan positif, dan kembali pada nilai-nilai Islam dengan semangat persaudaraan.",
    },
  ],
  timelineItems: [
    {
      period: "Agustus 2025",
      title: "Identifikasi Kebutuhan dan Inisiatif Warga",
      description:
        "Menghimpun kebutuhan jamaah karena pertumbuhan umat, jarak masjid yang jauh, dan kebutuhan kegiatan keagamaan yang lebih aktif.",
    },
    {
      period: "Agustus - September 2025",
      title: "Pengumpulan Dukungan Masyarakat",
      description:
        "Mengacu pada Peraturan Bersama Menteri Agama dan Menteri Dalam Negeri No. 9 dan 8 Tahun 2006 sebagai pijakan dukungan masyarakat.",
    },
    {
      period: "September - Desember 2025",
      title: "Pembentukan Panitia",
      description:
        "Menyusun kepanitiaan yang terdiri dari tokoh masyarakat, tokoh agama, dan perwakilan warga untuk memimpin seluruh proses.",
    },
    {
      period: "Agustus - September 2025",
      title: "Pengurusan Izin Mendirikan Bangunan",
      description:
        "Menyiapkan legalitas, administrasi, dan pengurusan Persetujuan Bangunan Gedung (PBG) serta dokumen pendukung lainnya.",
    },
    {
      period: "Desember 2025",
      title: "Penyusunan Proposal dan Desain Bangunan",
      description:
        "Menyusun proposal, RAB, denah, gambar teknis masjid, serta melengkapi sertifikat tanah atau bukti hibah/wakaf.",
    },
    {
      period: "2026",
      title: "Pelaksanaan Pembangunan dan Operasional Awal",
      description:
        "Menjalankan pembangunan sesuai RAB dan rencana pembangunan awal sambil menyiapkan fungsi operasional markas dakwah.",
    },
  ],
  committeeItems: [
    {
      section: "Penasehat & Pembina",
      leads: "Ustadzah Niswah, Prof. Rudi, Ustadz Munif, Kasepuhan",
      bullets: [
        "Memberikan arahan strategis dan pertimbangan kebijakan.",
        "Menjadi rujukan jika terjadi permasalahan prinsip dalam pembangunan dan dakwah.",
        "Menguatkan dukungan dakwah, donatur, dan hubungan dengan tokoh masyarakat.",
      ],
    },
    {
      section: "Ketua / PIC Utama",
      leads: "Akh Saiful",
      bullets: [
        "Memimpin keseluruhan proses pembangunan dan mengoordinasikan seluruh anggota panitia.",
        "Menjadi penanggung jawab utama perizinan, keuangan, dan hubungan eksternal.",
        "Menyampaikan laporan pertanggungjawaban kepada umat secara berkala.",
      ],
    },
    {
      section: "Wakil Ketua",
      leads: "Ustadz Bahrul",
      bullets: [
        "Membantu tugas ketua dan menggantikan bila berhalangan.",
        "Mengawasi progres setiap seksi agar sinkron dan tidak tumpang tindih.",
      ],
    },
    {
      section: "Sekretaris",
      leads: "Akh Haidar & Fauzi",
      bullets: [
        "Menyusun dokumen resmi seperti proposal, surat, dan notulen rapat.",
        "Mengarsipkan dukungan masyarakat, surat rekomendasi, serta perizinan.",
        "Menjadi pusat administrasi panitia.",
      ],
    },
    {
      section: "Bendahara",
      leads: "Ustd Triaji",
      bullets: [
        "Mencatat pemasukan dan pengeluaran secara rinci dan transparan.",
        "Membuat laporan keuangan berkala kepada panitia dan masyarakat.",
        "Bersama fundraising membuka rekening atau dompet donasi resmi.",
      ],
    },
    {
      section: "Seksi Fundraising",
      leads: "Akh Samsul, Haidar, Akh Nafi",
      bullets: [
        "Menyusun strategi penggalangan dana offline dan online.",
        "Menyebarkan proposal kepada donatur individu, komunitas, dan lembaga.",
        "Membuat kegiatan donasi kreatif dan kampanye publik.",
      ],
    },
    {
      section: "Seksi Keuangan",
      leads: "Akh Izzudin",
      bullets: [
        "Membantu bendahara dalam pencatatan teknis dan pengawasan anggaran.",
        "Mengatur alur distribusi keuangan sesuai jadwal pembangunan.",
      ],
    },
    {
      section: "Seksi Perizinan / Legalitas",
      leads: "Akh Arsyad",
      bullets: [
        "Mengurus dokumen perizinan, rekomendasi FKUB, dan Kemenag.",
        "Memastikan status tanah hibah/wakaf jelas dan legal.",
      ],
    },
    {
      section: "Seksi Pembangunan",
      leads: "Akh Ilyas",
      bullets: [
        "Bekerja sama dengan konsultan atau arsitek untuk desain bangunan.",
        "Mengawasi proses fisik pembangunan di lapangan.",
        "Mengatur logistik bahan bangunan dan perlengkapan.",
      ],
    },
    {
      section: "Seksi Dakwah & Sosial",
      leads: "Akh Wildan & Yusuf",
      bullets: [
        "Merancang program dakwah sejak awal seperti TPQ, kajian, dan majelis remaja.",
        "Menyiapkan SDM dakwah dan pengelolaan kegiatan setelah masjid aktif.",
        "Mendistribusikan bantuan sosial dan membangun fungsi sosial masjid sejak dini.",
      ],
    },
    {
      section: "Seksi PR / Humas",
      leads: "Tim Humas Panitia",
      bullets: [
        "Membangun komunikasi dengan warga sekitar dan tokoh masyarakat.",
        "Membuat media publikasi seperti pamflet, baliho, dan akun sosial media.",
        "Menjawab isu yang mungkin muncul selama proses pembangunan.",
      ],
    },
  ],
  fundingItems: [
    {
      title: "Donasi Publik dan Donatur",
      description:
        "Menghimpun dukungan dari donatur individu, komunitas, dan kampanye media sosial untuk memperluas partisipasi umat.",
    },
    {
      title: "Usaha Mandiri Yayasan",
      description:
        "Mengembangkan kanal usaha mandiri yayasan sebagai penopang gerakan dan keberlanjutan program markas dakwah.",
    },
    {
      title: "Pengelolaan Transparan",
      description:
        "Seluruh dana dikelola secara terbuka melalui laporan berkala, audit internal, dan komunikasi rutin kepada publik.",
    },
  ],
  roadmapItems: [
    {
      phase: "Tahun Pertama - 2025",
      title: "Penguatan SDM dan Perencanaan Markas Dakwah",
      description:
        "Fokus pada pengembangan internal panitia, konsolidasi tim, penyusunan proposal digital, desain, dan kesiapan branding.",
    },
    {
      phase: "Tahun Kedua - 2026",
      title: "Eksekusi Pembangunan dan Pematangan Operasional",
      description:
        "Menjalankan pembangunan fisik, memperkuat platform digital, dan menyiapkan program dakwah serta database donatur.",
    },
    {
      phase: "Tahun Ketiga",
      title: "Evaluasi Menyeluruh dan Pengembangan Program",
      description:
        "Melakukan evaluasi pembangunan secara menyeluruh serta menata program markas dakwah yang komprehensif dan berkelanjutan.",
    },
  ],
};

export function isMasjidProfileSchemaMismatchError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("does not exist in the current database");
}

export function normalizeMasjidProfile(
  value?: Partial<MasjidProfileData> | Record<string, unknown> | null
): MasjidProfileData {
  const source = (value ?? {}) as Record<string, unknown>;

  return {
    name: readString(source.name, DEFAULT_MASJID_PROFILE.name),
    description: readString(source.description, DEFAULT_MASJID_PROFILE.description),
    address: readString(source.address, DEFAULT_MASJID_PROFILE.address),
    city: readString(source.city, DEFAULT_MASJID_PROFILE.city),
    province: readString(source.province, DEFAULT_MASJID_PROFILE.province),
    postalCode: readString(source.postalCode, DEFAULT_MASJID_PROFILE.postalCode),
    phone: readString(source.phone, DEFAULT_MASJID_PROFILE.phone),
    email: readString(source.email, DEFAULT_MASJID_PROFILE.email),
    website: readString(source.website, DEFAULT_MASJID_PROFILE.website),
    latitude: readNumber(source.latitude, DEFAULT_MASJID_PROFILE.latitude),
    longitude: readNumber(source.longitude, DEFAULT_MASJID_PROFILE.longitude),
    logoUrl: readString(source.logoUrl, DEFAULT_MASJID_PROFILE.logoUrl),
    bannerUrl: readString(source.bannerUrl, DEFAULT_MASJID_PROFILE.bannerUrl),
    facebook: readString(source.facebook, DEFAULT_MASJID_PROFILE.facebook),
    instagram: readString(source.instagram, DEFAULT_MASJID_PROFILE.instagram),
    youtube: readString(source.youtube, DEFAULT_MASJID_PROFILE.youtube),
    tiktok: readString(source.tiktok, DEFAULT_MASJID_PROFILE.tiktok),
    bankName: readString(source.bankName, DEFAULT_MASJID_PROFILE.bankName),
    bankAccount: readString(source.bankAccount, DEFAULT_MASJID_PROFILE.bankAccount),
    bankHolder: readString(source.bankHolder, DEFAULT_MASJID_PROFILE.bankHolder),
    foundationName: readString(
      source.foundationName,
      DEFAULT_MASJID_PROFILE.foundationName
    ),
    movementName: readString(source.movementName, DEFAULT_MASJID_PROFILE.movementName),
    heroTitle: readString(source.heroTitle, DEFAULT_MASJID_PROFILE.heroTitle),
    heroSubtitle: readString(source.heroSubtitle, DEFAULT_MASJID_PROFILE.heroSubtitle),
    backgroundText: readString(
      source.backgroundText,
      DEFAULT_MASJID_PROFILE.backgroundText
    ),
    visionStatement: readString(
      source.visionStatement,
      DEFAULT_MASJID_PROFILE.visionStatement
    ),
    visionItems: parseTypedArray(
      source.visionItems,
      DEFAULT_MASJID_PROFILE.visionItems,
      parseVisionItem
    ),
    timelineItems: parseTypedArray(
      source.timelineItems,
      DEFAULT_MASJID_PROFILE.timelineItems,
      parseTimelineItem
    ),
    committeeItems: parseTypedArray(
      source.committeeItems,
      DEFAULT_MASJID_PROFILE.committeeItems,
      parseCommitteeItem
    ),
    fundingItems: parseTypedArray(
      source.fundingItems,
      DEFAULT_MASJID_PROFILE.fundingItems,
      parseFundingItem
    ),
    roadmapItems: parseTypedArray(
      source.roadmapItems,
      DEFAULT_MASJID_PROFILE.roadmapItems,
      parseRoadmapItem
    ),
  };
}
