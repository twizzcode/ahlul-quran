import { eq } from "drizzle-orm";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import { apiError, apiSuccess } from "@/lib/utils";
import { db } from "@/src";
import { donation } from "@/src/db/schema";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminRequestContext();
  if (!context) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const [updated] = await db.update(donation).set({ status: "SUCCESS", paidAt: new Date(), updatedAt: new Date() }).where(eq(donation.id, id)).returning({ id: donation.id });

  if (!updated) {
    return apiError("Donasi tidak ditemukan.", 404);
  }

  return apiSuccess({ id }, "Donasi berhasil di-approve.");
}
