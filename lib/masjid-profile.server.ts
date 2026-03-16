import "server-only";

import prisma from "@/lib/prisma";
import {
  DEFAULT_MASJID_PROFILE,
  isMasjidProfileSchemaMismatchError,
  normalizeMasjidProfile,
} from "@/lib/masjid-profile";

export async function getMasjidProfileData() {
  try {
    const profile = await prisma.masjidProfile.findFirst();
    return normalizeMasjidProfile(profile);
  } catch (error) {
    if (isMasjidProfileSchemaMismatchError(error)) {
      console.warn(
        "Masjid profile schema is ahead of the active database. Falling back to default profile."
      );
      return DEFAULT_MASJID_PROFILE;
    }

    throw error;
  }
}
