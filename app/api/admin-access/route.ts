import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { isDashboardRole } from "@/lib/auth/user-roles";
import { db } from "@/src";
import { user as userTable } from "@/src/db/schema";

export async function GET() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(headerStore),
  });

  if (!session?.user) {
    return NextResponse.json({ allowed: false }, { status: 401 });
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
    columns: {
      role: true,
    },
  });

  if (!isDashboardRole(dbUser?.role)) {
    return NextResponse.json({ allowed: false }, { status: 403 });
  }

  return NextResponse.json({ allowed: true });
}
