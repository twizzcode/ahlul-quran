import { NextRequest } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDashboardRole } from "@/lib/user-roles";
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
    const headerStore = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headerStore),
    });

    if (!session?.user || !isDashboardRole(session.user.role)) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const validated = createGallerySchema.parse(body);
    const authorId =
      typeof body.authorId === "string" && body.authorId.trim()
        ? body.authorId
        : session.user.id;

    const gallery = await prisma.gallery.create({
      data: {
        title: validated.title,
        description: validated.description,
        authorId,
        images: {
          create: validated.images.map((image, index) => ({
            url: image.url,
            caption: image.caption?.trim() || null,
            order: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        author: {
          select: { id: true, name: true },
        },
        _count: {
          select: { images: true },
        },
      },
    });

    return apiSuccess(gallery, "Galeri berhasil dibuat");
  } catch (error) {
    console.error("Error creating gallery:", error);
    return apiError("Gagal membuat galeri", 500);
  }
}
