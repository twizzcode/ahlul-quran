import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import {
  DEFAULT_MASJID_PROFILE,
  isMasjidProfileSchemaMismatchError,
  normalizeMasjidProfile,
} from "@/lib/masjid-profile";
import { updateMasjidProfileSchema } from "@/lib/validators";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

// ============================================================
// GET /api/masjid-profile - Get masjid profile (public)
// ============================================================

export async function GET() {
  try {
    const profile = await prisma.masjidProfile.findFirst();
    return apiSuccess(profile ? normalizeMasjidProfile(profile) : DEFAULT_MASJID_PROFILE);
  } catch (error) {
    if (isMasjidProfileSchemaMismatchError(error)) {
      console.warn(
        "Masjid profile schema is ahead of the active database. Returning default profile payload."
      );
      return apiSuccess(DEFAULT_MASJID_PROFILE);
    }

    console.error("Error fetching masjid profile:", error);
    return apiError("Gagal mengambil profil masjid", 500);
  }
}

// ============================================================
// PUT /api/masjid-profile - Update masjid profile (admin only)
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateMasjidProfileSchema.parse(body);

    // Upsert: create if not exists, update if exists
    const existing = await prisma.masjidProfile.findFirst();
    const baseProfile = existing
      ? normalizeMasjidProfile(existing)
      : DEFAULT_MASJID_PROFILE;
    const normalized = normalizeMasjidProfile({
      ...baseProfile,
      ...validated,
    });

    let profile;
    if (existing) {
      profile = await prisma.masjidProfile.update({
        where: { id: existing.id },
        data: normalized,
      });
    } else {
      profile = await prisma.masjidProfile.create({
        data: {
          ...normalized,
        },
      });
    }

    return apiSuccess(
      normalizeMasjidProfile(profile),
      "Profil masjid berhasil diperbarui"
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(error.issues[0]?.message || "Data profil tidak valid", 400);
    }

    if (isMasjidProfileSchemaMismatchError(error)) {
      return apiError(
        "Skema database profil masjid belum sinkron dengan kode terbaru. Jalankan migrasi database terlebih dahulu.",
        503
      );
    }

    console.error("Error updating masjid profile:", error);
    return apiError("Gagal memperbarui profil masjid", 500);
  }
}
