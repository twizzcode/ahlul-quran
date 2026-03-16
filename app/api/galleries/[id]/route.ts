import { NextRequest } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteUnusedGalleryAssets, getManagedGalleryAssetUrls, getRemovedGalleryAssetUrls } from "@/lib/gallery-assets";
import { isDashboardRole } from "@/lib/user-roles";
import { apiError, apiSuccess } from "@/lib/utils";
import { updateGallerySchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gallery = await prisma.gallery.findUnique({
      where: { id },
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

    if (!gallery) {
      return apiError("Galeri tidak ditemukan", 404);
    }

    return apiSuccess(gallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return apiError("Gagal mengambil data galeri", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headerStore = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headerStore),
    });

    if (!session?.user || !isDashboardRole(session.user.role)) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateGallerySchema.parse(body);

    const existingGallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!existingGallery) {
      return apiError("Galeri tidak ditemukan", 404);
    }

    const nextImages = validated.images?.map((image, index) => ({
      url: image.url,
      caption: image.caption?.trim() || null,
      order: index,
    }));

    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        ...(nextImages
          ? {
              images: {
                deleteMany: {},
                create: nextImages,
              },
            }
          : {}),
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

    if (nextImages) {
      const removedUrls = getRemovedGalleryAssetUrls(existingGallery, {
        images: nextImages,
      });

      await deleteUnusedGalleryAssets(removedUrls, id);
    }

    return apiSuccess(gallery, "Galeri berhasil diperbarui");
  } catch (error) {
    console.error("Error updating gallery:", error);
    return apiError("Gagal memperbarui galeri", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headerStore = await headers();
    const session = await auth.api.getSession({
      headers: new Headers(headerStore),
    });

    if (!session?.user || !isDashboardRole(session.user.role)) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;
    const existingGallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!existingGallery) {
      return apiError("Galeri tidak ditemukan", 404);
    }

    const managedUrls = getManagedGalleryAssetUrls(existingGallery);
    await prisma.gallery.delete({ where: { id } });
    await deleteUnusedGalleryAssets(managedUrls);

    return apiSuccess(null, "Galeri berhasil dihapus");
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return apiError("Gagal menghapus galeri", 500);
  }
}
