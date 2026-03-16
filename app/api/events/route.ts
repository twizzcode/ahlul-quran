import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiPaginated, generateSlug } from "@/lib/utils";
import { createEventSchema } from "@/lib/validators";

// ============================================================
// GET /api/events - List events (public)
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (upcoming === "true") {
      where.startDate = { gte: new Date() };
      where.status = "UPCOMING";
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return apiPaginated(events, total, page, limit);
  } catch (error) {
    console.error("Error fetching events:", error);
    return apiError("Gagal mengambil data kegiatan", 500);
  }
}

// ============================================================
// POST /api/events - Create event (admin only)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createEventSchema.parse(body);

    const slug = generateSlug(validated.title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const event = await prisma.event.create({
      data: {
        ...validated,
        slug: finalSlug,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        authorId: body.authorId,
      },
    });

    return apiSuccess(event, "Kegiatan berhasil dibuat");
  } catch (error) {
    console.error("Error creating event:", error);
    return apiError("Gagal membuat kegiatan", 500);
  }
}
