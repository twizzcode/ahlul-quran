import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import {
  DEFAULT_MASJID_PROFILE,
  isDatabaseConnectivityError,
  isMasjidProfileReadFallbackError,
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
    if (isMasjidProfileReadFallbackError(error)) {
      const reason = isDatabaseConnectivityError(error)
        ? "Database masjid profile tidak dapat dijangkau. Mengembalikan profil default."
        : "Masjid profile schema is ahead of the active database. Returning default profile payload.";
      console.warn(
        reason
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
    const existing = await prisma.masjidProfile.findFirst();
    const editablePayload = {
      ...validated,
    };

    let profile;
    if (existing) {
      profile = await prisma.masjidProfile.update({
        where: { id: existing.id },
        data: editablePayload,
      });
    } else {
      profile = await prisma.masjidProfile.create({
        data: {
          name: DEFAULT_MASJID_PROFILE.name,
          address: DEFAULT_MASJID_PROFILE.address,
          city: DEFAULT_MASJID_PROFILE.city,
          province: DEFAULT_MASJID_PROFILE.province,
          ...editablePayload,
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

    if (isDatabaseConnectivityError(error)) {
      return apiError(
        "Database profil masjid sedang tidak dapat dijangkau. Coba lagi setelah koneksi database normal.",
        503
      );
    }

    console.error("Error updating masjid profile:", error);
    return apiError("Gagal memperbarui profil masjid", 500);
  }
}
