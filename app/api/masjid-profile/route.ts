import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import {
  isMasjidProfileSchemaMismatchError,
  normalizeMasjidProfile,
} from "@/lib/masjid/masjid-profile";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { masjidProfile } from "@/src/db/schema";

const PROFILE_ID = "main";

export async function PUT(request: Request) {
  try {
    const context = await getAdminRequestContext();
    if (!context) {
      return apiError("Unauthorized", 401);
    }

    const existing = await db.query.masjidProfile.findFirst({
      where: eq(masjidProfile.id, PROFILE_ID),
    });
    const currentProfile = normalizeMasjidProfile(existing);
    const incomingPayload = await request.json();
    const payload = normalizeMasjidProfile({
      ...currentProfile,
      ...(incomingPayload as Record<string, unknown>),
    });
    const primaryBankAccount =
      payload.donationBankAccounts.find(
        (item) =>
          item.isActive &&
          (item.bankName.trim() || item.bankAccount.trim() || item.bankHolder.trim()),
      ) ??
      payload.donationBankAccounts.find(
        (item) =>
          item.bankName.trim() || item.bankAccount.trim() || item.bankHolder.trim(),
      ) ?? null;
    const baseValues = {
      id: PROFILE_ID,
      name: payload.name,
      description: payload.description,
      address: payload.address,
      city: payload.city,
      province: payload.province,
      postalCode: payload.postalCode,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      latitude: payload.latitude,
      longitude: payload.longitude,
      logoUrl: payload.logoUrl,
      bannerUrl: payload.bannerUrl,
      facebook: payload.facebook,
      instagram: payload.instagram,
      youtube: payload.youtube,
      tiktok: payload.tiktok,
      qrisEnabled: payload.qrisEnabled,
      qrisImageUrl: payload.qrisImageUrl,
      donationBankAccounts: payload.donationBankAccounts,
      bankName: primaryBankAccount?.bankName || payload.bankName,
      bankAccount: primaryBankAccount?.bankAccount || payload.bankAccount,
      bankHolder: primaryBankAccount?.bankHolder || payload.bankHolder,
      foundationName: payload.foundationName,
      movementName: payload.movementName,
      heroTitle: payload.heroTitle,
      heroSubtitle: payload.heroSubtitle,
      homepageFeatureBadge: payload.homepageFeatureBadge,
      homepageFeatureTitle: payload.homepageFeatureTitle,
      homepageFeatureDescription: payload.homepageFeatureDescription,
      homepageFeatureDonationEnabled: payload.homepageFeatureDonationEnabled,
      homepageFeatureCampaignId: payload.homepageFeatureCampaignId || null,
      homepageFeaturePrimaryButtonText: payload.homepageFeaturePrimaryButtonText,
      homepageFeatureProfileButtonText: payload.homepageFeatureProfileButtonText,
      homepageTestimonials: payload.homepageTestimonials,
      homepageCtaTitle: payload.homepageCtaTitle,
      homepageCtaDescription: payload.homepageCtaDescription,
      homepageCtaButtonText: payload.homepageCtaButtonText,
      homepageCtaCards: payload.homepageCtaCards,
      backgroundText: payload.backgroundText,
      visionStatement: payload.visionStatement,
      visionItems: payload.visionItems,
      timelineItems: payload.timelineItems,
      committeeItems: payload.committeeItems,
      fundingItems: payload.fundingItems,
      roadmapItems: payload.roadmapItems,
    };

    const saved = existing
      ? (
          await db
            .update(masjidProfile)
            .set({ ...baseValues, updatedAt: new Date() })
            .where(eq(masjidProfile.id, PROFILE_ID))
            .returning()
        )[0]
      : (await db.insert(masjidProfile).values(baseValues).returning())[0];

    return apiSuccess(saved, "Profil masjid berhasil diperbarui.");
  } catch (error) {
    if (isMasjidProfileSchemaMismatchError(error)) {
      return apiError(
        "Schema database untuk masjid profile belum sinkron. Jalankan migration terbaru lalu coba lagi.",
        409,
      );
    }

    throw error;
  }
}
