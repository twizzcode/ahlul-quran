import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { updateEventSchema } from "@/lib/validators";

// ============================================================
// GET /api/events/[slug]
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    if (!event) return apiError("Kegiatan tidak ditemukan", 404);
    return apiSuccess(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return apiError("Gagal mengambil data kegiatan", 500);
  }
}

// ============================================================
// PATCH /api/events/[slug]
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const validated = updateEventSchema.parse(body);

    const event = await prisma.event.update({
      where: { slug },
      data: {
        ...validated,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      },
    });

    return apiSuccess(event, "Kegiatan berhasil diperbarui");
  } catch (error) {
    console.error("Error updating event:", error);
    return apiError("Gagal memperbarui kegiatan", 500);
  }
}

// ============================================================
// DELETE /api/events/[slug]
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.event.delete({ where: { slug } });
    return apiSuccess(null, "Kegiatan berhasil dihapus");
  } catch (error) {
    console.error("Error deleting event:", error);
    return apiError("Gagal menghapus kegiatan", 500);
  }
}
