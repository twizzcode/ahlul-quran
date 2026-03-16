import { NextRequest } from "next/server";
import { uploadToR2, generateFileKey, deleteFromR2, extractKeyFromUrl } from "@/lib/r2";
import { apiSuccess, apiError } from "@/lib/utils";

function getMissingR2EnvVars() {
  const required = [
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
  ] as const;

  return required.filter((key) => !process.env[key] || process.env[key]?.trim() === "");
}

function getR2EndpointConfigError() {
  const endpoint = process.env.R2_ENDPOINT?.trim() || "";
  if (!endpoint) {
    return null;
  }

  let host = "";
  try {
    host = new URL(endpoint).host;
  } catch {
    return "R2_ENDPOINT tidak valid. Gunakan format URL, contoh: https://<account_id>.r2.cloudflarestorage.com";
  }

  if (host.endsWith(".r2.dev")) {
    return "R2_ENDPOINT tidak boleh domain publik r2.dev. Gunakan endpoint API R2: https://<account_id>.r2.cloudflarestorage.com";
  }

  if (!host.endsWith(".r2.cloudflarestorage.com")) {
    return "Host R2_ENDPOINT tidak sesuai. Gunakan endpoint API Cloudflare R2: https://<account_id>.r2.cloudflarestorage.com";
  }

  try {
    const pathname = new URL(endpoint).pathname;
    if (pathname && pathname !== "/") {
      return "R2_ENDPOINT tidak boleh mengandung path bucket. Gunakan endpoint root: https://<account_id>.r2.cloudflarestorage.com";
    }
  } catch {
    return "R2_ENDPOINT tidak valid. Gunakan format URL, contoh: https://<account_id>.r2.cloudflarestorage.com";
  }

  return null;
}

function getR2PublicUrlConfigError() {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim() || "";
  if (!publicUrl) {
    return null;
  }

  let host = "";
  try {
    host = new URL(publicUrl).host;
  } catch {
    return "R2_PUBLIC_URL tidak valid. Gunakan custom domain publik atau URL bucket publik R2.";
  }

  if (host.endsWith(".r2.cloudflarestorage.com")) {
    return "R2_PUBLIC_URL tidak boleh endpoint API Cloudflare R2. Gunakan custom domain publik atau URL bucket publik seperti https://<bucket>.<account>.r2.dev";
  }

  return null;
}

async function transformUploadFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  ) {
    const sharp = (await import("sharp")).default;
    const transformedBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    return {
      buffer: transformedBuffer,
      contentType: "image/webp",
      extension: "webp",
    };
  }

  return {
    buffer,
    contentType: file.type,
    extension: undefined as string | undefined,
  };
}

// ============================================================
// POST /api/upload - Upload file to Cloudflare R2
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const missingEnvs = getMissingR2EnvVars();
    if (missingEnvs.length > 0) {
      return apiError(
        `Konfigurasi Cloudflare R2 belum lengkap: ${missingEnvs.join(", ")}`,
        500,
      );
    }

    const endpointError = getR2EndpointConfigError();
    if (endpointError) {
      return apiError(endpointError, 500);
    }

    const publicUrlError = getR2PublicUrlConfigError();
    if (publicUrlError) {
      return apiError(publicUrlError, 500);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return apiError("File tidak ditemukan", 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return apiError("Ukuran file maksimal 10MB", 400);
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return apiError("Tipe file tidak didukung", 400);
    }

    const transformed = await transformUploadFile(file);
    const key = generateFileKey(folder, file.name, transformed.extension);
    const url = await uploadToR2(
      transformed.buffer,
      key,
      transformed.contentType,
    );

    return apiSuccess({ url, key }, "File berhasil diupload");
  } catch (error) {
    console.error("Error uploading file:", error);
    const message =
      error instanceof Error && error.message
        ? `Gagal mengupload file: ${error.message}`
        : "Gagal mengupload file";
    return apiError(message, 500);
  }
}

// ============================================================
// DELETE /api/upload - Delete file from R2
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    const missingEnvs = getMissingR2EnvVars();
    if (missingEnvs.length > 0) {
      return apiError(
        `Konfigurasi Cloudflare R2 belum lengkap: ${missingEnvs.join(", ")}`,
        500,
      );
    }

    const endpointError = getR2EndpointConfigError();
    if (endpointError) {
      return apiError(endpointError, 500);
    }

    const publicUrlError = getR2PublicUrlConfigError();
    if (publicUrlError) {
      return apiError(publicUrlError, 500);
    }

    const { url } = await request.json();

    if (!url) {
      return apiError("URL file tidak ditemukan", 400);
    }

    const key = extractKeyFromUrl(url);
    await deleteFromR2(key);

    return apiSuccess(null, "File berhasil dihapus");
  } catch (error) {
    console.error("Error deleting file:", error);
    const message =
      error instanceof Error && error.message
        ? `Gagal menghapus file: ${error.message}`
        : "Gagal menghapus file";
    return apiError(message, 500);
  }
}
