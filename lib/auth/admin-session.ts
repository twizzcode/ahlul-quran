import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { isDashboardRole } from "@/lib/auth/user-roles";
import { db } from "@/src";
import { user } from "@/src/db/schema";

export async function getAdminRequestContext() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(headerStore),
  });

  if (!session?.user) {
    return null;
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || !isDashboardRole(dbUser.role)) {
    return null;
  }

  return {
    session,
    user: dbUser,
  };
}
