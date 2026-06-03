import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { donation } from "@/src/db/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const [deleted] = await db
    .delete(donation)
    .where(eq(donation.id, id))
    .returning({ id: donation.id });

  if (!deleted) {
    return apiError("Donasi tidak ditemukan.", 404);
  }

  return apiSuccess({ id }, "Donasi berhasil dihapus.");
}
