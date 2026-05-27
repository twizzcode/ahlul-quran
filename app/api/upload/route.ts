import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { uploadToR2 } from "@/lib/storage/r2";
import { ALLOWED_UPLOAD_FOLDERS } from "@/lib/storage/upload-folders";
import { apiError, apiSuccess } from "@/lib/utils";
import sharp from "sharp";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 2400;
const WEBP_QUALITY = 84;

function buildDatedFolder(folder: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${folder}/${year}/${month}`;
}

function buildUploadKey(folder: string, filename: string) {
  const trimmedName = filename.trim() || "image";
  const sanitizedName = trimmedName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${folder}/${Date.now()}-${crypto.randomUUID()}-${sanitizedName || "image"}.webp`;
}

async function optimizeImageToWebp(file: File) {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const transformer = sharp(inputBuffer, { animated: false }).rotate();
  const metadata = await transformer.metadata();

  if (metadata.pages && metadata.pages > 1) {
    throw new Error("Gambar animasi belum didukung untuk konversi WebP.");
  }

  return transformer
    .resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 5,
      smartSubsample: true,
    })
    .toBuffer();
}

export async function POST(request: Request) {
  try {
    const context = await getAdminRequestContext();
    if (!context) {
      return apiError("Unauthorized", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return apiError("File upload tidak ditemukan.");
    }

    if (typeof folder !== "string" || !ALLOWED_UPLOAD_FOLDERS.has(folder)) {
      return apiError("Folder upload tidak diizinkan.");
    }

    if (!file.type.startsWith("image/")) {
      return apiError("File harus berupa gambar.");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return apiError("Ukuran file maksimal 10MB.");
    }

    const datedFolder = buildDatedFolder(folder);
    const fileKey = buildUploadKey(datedFolder, file.name);
    const optimizedBuffer = await optimizeImageToWebp(file);
    const url = await uploadToR2(optimizedBuffer, fileKey, "image/webp");

    return apiSuccess(
      {
        url,
        key: fileKey,
      },
      "File berhasil diupload."
    );
  } catch (error) {
    console.error("Failed to upload file to R2:", error);
    return apiError(
      error instanceof Error ? error.message : "Gagal mengupload file."
    );
  }
}
