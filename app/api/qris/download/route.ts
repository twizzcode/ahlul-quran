import { apiError } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url")?.trim();
  const orderId = searchParams.get("order_id")?.trim() || "qris";

  if (!imageUrl) {
    return apiError("URL QRIS tidak valid.", 400);
  }

  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return apiError("Gagal mengambil gambar QRIS.", 400);
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${orderId}-qris.png"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return apiError("Gagal mengunduh QRIS.", 500);
  }
}
