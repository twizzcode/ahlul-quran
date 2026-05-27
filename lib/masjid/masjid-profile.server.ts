import "server-only";

import dbQuery from "@/lib/data/db-query";
import {
  DEFAULT_MASJID_PROFILE,
  isDatabaseConnectivityError,
  isMasjidProfileReadFallbackError,
  normalizeMasjidProfile,
} from "@/lib/masjid/masjid-profile";

export async function getMasjidProfileData() {
  try {
    const profile = await dbQuery.masjidProfile.findFirst();
    return normalizeMasjidProfile(profile);
  } catch (error) {
    if (isMasjidProfileReadFallbackError(error)) {
      const reason = isDatabaseConnectivityError(error)
        ? "Database masjid profile tidak dapat dijangkau. Menggunakan profil default."
        : "Masjid profile schema is ahead of the active database. Falling back to default profile.";
      console.warn(
        reason
      );
      return DEFAULT_MASJID_PROFILE;
    }

    throw error;
  }
}
