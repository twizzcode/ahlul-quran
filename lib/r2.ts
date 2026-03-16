import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============================================================
// Cloudflare R2 Configuration
// ============================================================

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  // Keep the host exactly as endpoint to avoid TLS host mismatch
  // on providers like Cloudflare R2.
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!; // Your custom domain or R2 public URL

function getPublicUrlConfig() {
  const publicUrl = new URL(PUBLIC_URL)
  const pathname = publicUrl.pathname.replace(/\/+$/, "")

  return {
    host: publicUrl.host,
    pathname,
  }
}

function getAllowedManagedHosts() {
  const { host } = getPublicUrlConfig()
  const hosts = new Set([host])
  const accountId = process.env.R2_ACCOUNT_ID?.trim()

  if (accountId) {
    hosts.add(`${accountId}.r2.cloudflarestorage.com`)
  }

  return hosts
}

// ============================================================
// Upload file to R2
// ============================================================

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string,
  cacheControl = "public, max-age=31536000, immutable"
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: cacheControl,
  });

  await R2.send(command);
  return `${PUBLIC_URL}/${key}`;
}

// ============================================================
// Delete file from R2
// ============================================================

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await R2.send(command);
}

// ============================================================
// Get presigned URL for direct upload
// ============================================================

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(R2, command, { expiresIn });
}

// ============================================================
// Get presigned URL for download
// ============================================================

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(R2, command, { expiresIn });
}

// ============================================================
// Helper: Generate unique file key
// ============================================================

export function generateFileKey(
  folder: string,
  filename: string,
  extensionOverride?: string
): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const baseName = sanitized.replace(/\.[^.]+$/, "");
  const extension = extensionOverride
    ? extensionOverride.replace(/^\.+/, "")
    : sanitized.split(".").pop() || "";
  const finalName = extension ? `${baseName}.${extension}` : baseName;
  return `${folder}/${timestamp}-${finalName}`;
}

// ============================================================
// Helper: Extract key from URL
// ============================================================

export function extractKeyFromUrl(url: string): string {
  const assetUrl = new URL(url)
  const allowedHosts = getAllowedManagedHosts()

  if (!allowedHosts.has(assetUrl.host)) {
    throw new Error("URL file tidak berasal dari host R2 yang dikelola aplikasi.")
  }

  const { pathname } = getPublicUrlConfig()
  const assetPath = assetUrl.pathname

  const normalizedPrefix = pathname ? `${pathname}/` : "/"
  if (assetUrl.host === getPublicUrlConfig().host && !assetPath.startsWith(normalizedPrefix)) {
    throw new Error("URL file tidak cocok dengan R2_PUBLIC_URL yang aktif.")
  }

  if (assetUrl.host === getPublicUrlConfig().host) {
    return assetPath.slice(normalizedPrefix.length)
  }

  return assetPath.replace(/^\/+/, "")
}

export function isManagedR2Url(url: string): boolean {
  try {
    const assetUrl = new URL(url)
    const { host, pathname } = getPublicUrlConfig()
    const allowedHosts = getAllowedManagedHosts()

    if (!allowedHosts.has(assetUrl.host)) {
      return false
    }

    const normalizedPrefix = pathname ? `${pathname}/` : "/"
    return assetUrl.host === host
      ? assetUrl.pathname.startsWith(normalizedPrefix)
      : true
  } catch {
    return false
  }
}

export default R2;
