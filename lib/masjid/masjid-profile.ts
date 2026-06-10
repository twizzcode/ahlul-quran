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
  imageUrl: string;
  bullets: string[];
};

export type FundingItem = {
  title: string;
  description: string;
};

export type DonationBankAccount = {
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  logoUrl: string;
  isActive: boolean;
};

export type RoadmapItem = {
  phase: string;
  title: string;
  description: string;
};

export type HomepageTestimonialPlatform =
  | ""
  | "instagram"
  | "tiktok"
  | "linkedin";

export type HomepageTestimonialItem = {
  quote: string;
  name: string;
  role: string;
  imageUrl: string;
  socialPlatform: HomepageTestimonialPlatform;
  socialUrl: string;
};

export type HomepageCtaCardItem = {
  title: string;
  imageUrl: string;
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
  qrisEnabled: boolean;
  qrisImageUrl: string;
  qrisIconUrl: string;
  qrisHolderName: string;
  donationBankAccounts: DonationBankAccount[];
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  foundationName: string;
  movementName: string;
  heroTitle: string;
  heroSubtitle: string;
  homepageFeatureBadge: string;
  homepageFeatureTitle: string;
  homepageFeatureDescription: string;
  homepageFeatureDonationEnabled: boolean;
  homepageFeatureCampaignId: string;
  homepageFeaturePrimaryButtonText: string;
  homepageFeatureProfileButtonText: string;
  homepageTestimonials: HomepageTestimonialItem[];
  homepageCtaTitle: string;
  homepageCtaDescription: string;
  homepageCtaButtonText: string;
  homepageCtaCards: HomepageCtaCardItem[];
  backgroundText: string;
  visionStatement: string;
  visionItems: VisionItem[];
  timelineItems: TimelineItem[];
  committeeItems: CommitteeItem[];
  fundingItems: FundingItem[];
  roadmapItems: RoadmapItem[];
};

function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readTestimonialPlatform(
  value: unknown,
  fallback: HomepageTestimonialPlatform,
) {
  return value === "instagram" || value === "tiktok" || value === "linkedin" || value === ""
    ? value
    : fallback;
}

function readStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter((item): item is string => typeof item === "string");
  return items.length > 0 ? items : fallback;
}

function isAdvisoryCommitteeSection(section: string) {
  return /penasehat|pembina/i.test(section);
}

function splitCommitteeNames(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/^kasepuhan$/i.test(item));
}

function normalizeCommitteeItems(items: CommitteeItem[]) {
  return items.flatMap((item) => {
    if (!isAdvisoryCommitteeSection(item.section)) {
      return [item];
    }

    const names = splitCommitteeNames(item.leads);

    if (names.length <= 1) {
      return [
        {
          ...item,
          section: item.section.trim() || "Penasehat",
          leads: names[0] || item.leads,
        },
      ];
    }

    return names.map((name, index) => ({
      ...item,
      section: `Penasehat ${index + 1}`,
      leads: name,
      imageUrl: "",
    }));
  });
}

function readObjectArray<T>(
  value: unknown,
  fallback: T[],
  mapper: (item: Record<string, unknown>) => T | null,
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      return mapper(item as Record<string, unknown>);
    })
    .filter((item): item is T => item !== null);

  return items.length > 0 ? items : fallback;
}

function normalizeDonationBankAccounts(
  value: unknown,
  fallback: DonationBankAccount[],
  legacy?: {
    bankName?: unknown;
    bankAccount?: unknown;
    bankHolder?: unknown;
  },
) {
  const items = readObjectArray(value, [], (item) => ({
    bankName: readString(item.bankName, ""),
    bankAccount: readString(item.bankAccount, ""),
    bankHolder: readString(item.bankHolder, ""),
    logoUrl: readString(item.logoUrl, ""),
    isActive: readBoolean(item.isActive, true),
  })).filter(
    (item) =>
      item.bankName.trim() ||
      item.bankAccount.trim() ||
      item.bankHolder.trim() ||
      item.logoUrl.trim(),
  );

  if (items.length > 0) {
    return items;
  }

  const legacyBankName = readString(legacy?.bankName, "");
  const legacyBankAccount = readString(legacy?.bankAccount, "");
  const legacyBankHolder = readString(legacy?.bankHolder, "");

  if (legacyBankName || legacyBankAccount || legacyBankHolder) {
    return [
      {
        bankName: legacyBankName,
        bankAccount: legacyBankAccount,
        bankHolder: legacyBankHolder,
        logoUrl: "",
        isActive: true,
      },
    ];
  }

  return fallback;
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
  qrisEnabled: true,
  qrisImageUrl: "",
  qrisIconUrl: "",
  qrisHolderName: "",
  donationBankAccounts: [
    {
      bankName: "",
      bankAccount: "",
      bankHolder: "",
      logoUrl: "",
      isActive: true,
    },
  ],
  bankName: "",
  bankAccount: "",
  bankHolder: "",
  foundationName: "Yayasan Ahlul Qur'an Cinta Indonesia",
  movementName: "Gerakan Semilyar Tangan",
  heroTitle: "Pembangunan Masjid Ahlul Qur'an",
  heroSubtitle:
    "Markas dakwah yang diproyeksikan menjadi pusat peribadatan, pendidikan, dan pemberdayaan umat melalui gerakan kolektif yang terarah dan berkelanjutan.",
  homepageFeatureBadge: "Yayasan Ahlul Qur'an Cinta Indonesia",
  homepageFeatureTitle: "Pembangunan Masjid Ahlul Qur'an #masjidpusatsolusi",
  homepageFeatureDescription:
    "Markas dakwah yang diproyeksikan menjadi pusat peribadatan, pendidikan, dan pemberdayaan umat melalui gerakan kolektif yang terarah dan berkelanjutan.",
  homepageFeatureDonationEnabled: true,
  homepageFeatureCampaignId: "",
  homepageFeaturePrimaryButtonText: "Dukung Gerakan Semilyar Tangan",
  homepageFeatureProfileButtonText: "Lihat Profil Markas",
  homepageTestimonials: [],
  homepageCtaTitle: "Pembangunan Masjid Ahlul Qur'an",
  homepageCtaDescription:
    "Markas dakwah yang diproyeksikan menjadi pusat peribadatan, pendidikan, dan pemberdayaan umat melalui gerakan kolektif yang terarah dan berkelanjutan.",
  homepageCtaButtonText: "Dukung Pembangunan",
  homepageCtaCards: [
    { title: "Program Dakwah", imageUrl: "" },
    { title: "Markas Ibadah", imageUrl: "" },
    { title: "Ruang Tumbuh", imageUrl: "" },
    { title: "Gerakan Umat", imageUrl: "" },
    { title: "Pembinaan", imageUrl: "" },
    { title: "Pelayanan Sosial", imageUrl: "" },
  ],
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
  committeeItems: [],
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

function readErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

function readNestedError(error: unknown) {
  if (typeof error === "object" && error !== null && "cause" in error) {
    return (error as { cause?: unknown }).cause;
  }

  return null;
}

export function isMasjidProfileSchemaMismatchError(error: unknown) {
  const code = readErrorCode(error);
  if (code === "42703") {
    return true;
  }

  const nestedError = readNestedError(error);
  if (nestedError && isMasjidProfileSchemaMismatchError(nestedError)) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("does not exist in the current database") ||
    error.message.includes("column") && error.message.includes("does not exist")
  );
}

export function isDatabaseConnectivityError(error: unknown) {
  const code = readErrorCode(error);

  if (code === "P1001" || code === "ETIMEDOUT" || code === "ECONNREFUSED") {
    return true;
  }

  const nestedError = readNestedError(error);
  if (nestedError && isDatabaseConnectivityError(nestedError)) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return [
    "Can't reach database server",
    "Timed out fetching a new connection from the connection pool",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
  ].some((snippet) => error.message.includes(snippet));
}

export function isMasjidProfileReadFallbackError(error: unknown) {
  return (
    isMasjidProfileSchemaMismatchError(error) || isDatabaseConnectivityError(error)
  );
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
    qrisEnabled: readBoolean(
      source.qrisEnabled,
      DEFAULT_MASJID_PROFILE.qrisEnabled,
    ),
    qrisImageUrl: readString(
      source.qrisImageUrl,
      DEFAULT_MASJID_PROFILE.qrisImageUrl,
    ),
    qrisIconUrl: readString(
      source.qrisIconUrl,
      DEFAULT_MASJID_PROFILE.qrisIconUrl,
    ),
    qrisHolderName: readString(
      source.qrisHolderName,
      DEFAULT_MASJID_PROFILE.qrisHolderName,
    ),
    donationBankAccounts: normalizeDonationBankAccounts(
      source.donationBankAccounts,
      DEFAULT_MASJID_PROFILE.donationBankAccounts,
      {
        bankName: source.bankName,
        bankAccount: source.bankAccount,
        bankHolder: source.bankHolder,
      },
    ),
    bankName: readString(source.bankName, DEFAULT_MASJID_PROFILE.bankName),
    bankAccount: readString(source.bankAccount, DEFAULT_MASJID_PROFILE.bankAccount),
    bankHolder: readString(source.bankHolder, DEFAULT_MASJID_PROFILE.bankHolder),
    foundationName: readString(source.foundationName, DEFAULT_MASJID_PROFILE.foundationName),
    movementName: readString(source.movementName, DEFAULT_MASJID_PROFILE.movementName),
    heroTitle: readString(source.heroTitle, DEFAULT_MASJID_PROFILE.heroTitle),
    heroSubtitle: readString(source.heroSubtitle, DEFAULT_MASJID_PROFILE.heroSubtitle),
    homepageFeatureBadge: readString(
      source.homepageFeatureBadge,
      DEFAULT_MASJID_PROFILE.homepageFeatureBadge,
    ),
    homepageFeatureTitle: readString(
      source.homepageFeatureTitle,
      DEFAULT_MASJID_PROFILE.homepageFeatureTitle,
    ),
    homepageFeatureDescription: readString(
      source.homepageFeatureDescription,
      DEFAULT_MASJID_PROFILE.homepageFeatureDescription,
    ),
    homepageFeatureDonationEnabled: readBoolean(
      source.homepageFeatureDonationEnabled,
      DEFAULT_MASJID_PROFILE.homepageFeatureDonationEnabled,
    ),
    homepageFeatureCampaignId: readString(
      source.homepageFeatureCampaignId,
      DEFAULT_MASJID_PROFILE.homepageFeatureCampaignId,
    ),
    homepageFeaturePrimaryButtonText: readString(
      source.homepageFeaturePrimaryButtonText,
      DEFAULT_MASJID_PROFILE.homepageFeaturePrimaryButtonText,
    ),
    homepageFeatureProfileButtonText: readString(
      source.homepageFeatureProfileButtonText,
      DEFAULT_MASJID_PROFILE.homepageFeatureProfileButtonText,
    ),
    homepageTestimonials: readObjectArray(
      source.homepageTestimonials,
      DEFAULT_MASJID_PROFILE.homepageTestimonials,
      (item) => ({
        quote: readString(item.quote, ""),
        name: readString(item.name, ""),
        role: readString(item.role, ""),
        imageUrl: readString(item.imageUrl, ""),
        socialPlatform: readTestimonialPlatform(item.socialPlatform, ""),
        socialUrl: readString(item.socialUrl, ""),
      }),
    ).filter(
      (item) =>
        item.quote.trim() ||
        item.name.trim() ||
        item.role.trim() ||
        item.imageUrl.trim() ||
        item.socialPlatform ||
        item.socialUrl.trim(),
    ),
    homepageCtaTitle: readString(
      source.homepageCtaTitle,
      DEFAULT_MASJID_PROFILE.homepageCtaTitle,
    ),
    homepageCtaDescription: readString(
      source.homepageCtaDescription,
      DEFAULT_MASJID_PROFILE.homepageCtaDescription,
    ),
    homepageCtaButtonText: readString(
      source.homepageCtaButtonText,
      DEFAULT_MASJID_PROFILE.homepageCtaButtonText,
    ),
    homepageCtaCards: readObjectArray(
      source.homepageCtaCards,
      DEFAULT_MASJID_PROFILE.homepageCtaCards,
      (item) => ({
        title: readString(item.title, ""),
        imageUrl: readString(item.imageUrl, ""),
      }),
    ).filter((item) => item.title.trim() || item.imageUrl.trim()),
    backgroundText: readString(source.backgroundText, DEFAULT_MASJID_PROFILE.backgroundText),
    visionStatement: readString(source.visionStatement, DEFAULT_MASJID_PROFILE.visionStatement),
    visionItems: readObjectArray(source.visionItems, DEFAULT_MASJID_PROFILE.visionItems, (item) => ({
      title: readString(item.title, ""),
      description: readString(item.description, ""),
    })).filter((item) => item.title.trim() || item.description.trim()),
    timelineItems: readObjectArray(source.timelineItems, DEFAULT_MASJID_PROFILE.timelineItems, (item) => ({
      period: readString(item.period, ""),
      title: readString(item.title, ""),
      description: readString(item.description, ""),
    })).filter((item) => item.period.trim() || item.title.trim() || item.description.trim()),
    committeeItems: normalizeCommitteeItems(
      readObjectArray(
        source.committeeItems,
        DEFAULT_MASJID_PROFILE.committeeItems,
        (item) => ({
          section: readString(item.section, ""),
          leads: readString(item.leads, ""),
          imageUrl: readString(item.imageUrl, ""),
          bullets: readStringArray(item.bullets, []),
        }),
      ).filter(
        (item) =>
          item.section.trim() ||
          item.leads.trim() ||
          item.imageUrl.trim() ||
          item.bullets.length > 0,
      ),
    ),
    fundingItems: readObjectArray(source.fundingItems, DEFAULT_MASJID_PROFILE.fundingItems, (item) => ({
      title: readString(item.title, ""),
      description: readString(item.description, ""),
    })).filter((item) => item.title.trim() || item.description.trim()),
    roadmapItems: readObjectArray(source.roadmapItems, DEFAULT_MASJID_PROFILE.roadmapItems, (item) => ({
      phase: readString(item.phase, ""),
      title: readString(item.title, ""),
      description: readString(item.description, ""),
    })).filter((item) => item.phase.trim() || item.title.trim() || item.description.trim()),
  };
}
