type UploadResponse = {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    key: string;
  };
};

export type PendingUploadImage = {
  file: File;
  previewUrl: string;
};

export async function uploadFileToR2(file: File, folder: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as UploadResponse;

  if (!response.ok || !result.success || !result.data?.url) {
    throw new Error(result.message || "Gagal mengupload file.");
  }

  return result.data.url;
}

export async function replacePendingImageUrlsInHtml(
  html: string,
  pendingImages: PendingUploadImage[],
  folder: string,
) {
  if (!html.includes("blob:")) {
    return html;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const images = Array.from(document.querySelectorAll("img"));
  const uploads = new Map<string, Promise<string>>();

  for (const image of images) {
    const src = image.getAttribute("src")?.trim() || "";
    if (!src.startsWith("blob:")) {
      continue;
    }

    const pendingImage = pendingImages.find((item) => item.previewUrl === src);
    if (!pendingImage) {
      throw new Error("Ada gambar editor yang belum siap diupload. Coba pilih ulang gambar tersebut.");
    }

    if (!uploads.has(src)) {
      uploads.set(src, uploadFileToR2(pendingImage.file, folder));
    }
  }

  for (const image of images) {
    const src = image.getAttribute("src")?.trim() || "";
    const uploadedUrl = src ? await uploads.get(src) : null;
    if (uploadedUrl) {
      image.setAttribute("src", uploadedUrl);
    }
  }

  return document.body.innerHTML;
}
