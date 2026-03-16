import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiPaginated } from "@/lib/utils";
import { createGallerySchema } from "@/lib/validators";

// ============================================================
// GET /api/galleries - List galleries
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        include: {
          images: { orderBy: { order: "asc" }, take: 4 },
          author: { select: { id: true, name: true } },
          _count: { select: { images: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gallery.count(),
    ]);

    return apiPaginated(galleries, total, page, limit);
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return apiError("Gagal mengambil data galeri", 500);
  }
}

// ============================================================
// POST /api/galleries - Create gallery (admin only)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createGallerySchema.parse(body);

    const gallery = await prisma.gallery.create({
      data: {
        ...validated,
        authorId: body.authorId,
      },
    });

    return apiSuccess(gallery, "Galeri berhasil dibuat");
  } catch (error) {
    console.error("Error creating gallery:", error);
    return apiError("Gagal membuat galeri", 500);
  }
}
