export const UPLOAD_FOLDERS = {
  homepageMainLogo: "v1/homepage/main/logo",
  homepageMainHeroBanner: "v1/homepage/main/hero-banner",
  homepageMainHeroMobile: "v1/homepage/main/hero-mobile",
  homepageMainOg: "v1/homepage/main/og",
  homepageTestimonials: "v1/homepage/testimonials",
  homepageCtaCards: "v1/homepage/cta-cards",
  profileDonationQris: "v1/profile/donation/qris",
  profileDonationBanks: "v1/profile/donation/banks",
  profileCommittee: "v1/profile/committee",
  campaignsCovers: "campaigns/covers",
  galleriesImages: "galleries/images",
  articlesCovers: "articles/covers",
  articlesContent: "articles/content",
} as const;

export const ALLOWED_UPLOAD_FOLDERS = new Set<string>(Object.values(UPLOAD_FOLDERS));
