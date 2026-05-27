import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { AccountSignOutButton } from "@/components/auth/account-sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth/auth";
import { isDashboardRole, ROLE_LABELS } from "@/lib/auth/user-roles";
import { db } from "@/src";
import { user as userTable } from "@/src/db/schema";

export const metadata: Metadata = {
  title: "Akun",
  description: "Detail akun pengguna.",
};

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "A"
  );
}

export default async function AccountPage() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "lvh.me:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const session = await auth.api.getSession({
    headers: new Headers(headerStore),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const dbUser = await db.query.user.findFirst({
    where: eq(userTable.id, user.id),
    columns: {
      role: true,
    },
  });
  const role = dbUser?.role ?? "JAMAAH";
  const roleLabel = ROLE_LABELS[role] ?? role;
  const canOpenAdmin = isDashboardRole(role);
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const adminUrl = `${protocol}://admin.lvh.me${port}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-[calc(var(--home-nav-height)+2rem)]">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">{user.name}</h1>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="font-medium">User ID</dt>
            <dd className="mt-1 break-all text-muted-foreground">{user.id}</dd>
          </div>
          <div>
            <dt className="font-medium">Email Verified</dt>
            <dd className="mt-1 text-muted-foreground">
              {user.emailVerified ? "Ya" : "Belum"}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Sebagai</dt>
            <dd className="mt-1 text-muted-foreground">{roleLabel}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {canOpenAdmin ? (
            <Link
              href={adminUrl}
              className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-950"
            >
              Masuk Admin
            </Link>
          ) : null}
          <AccountSignOutButton />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Detail session</h2>
        <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </section>
    </main>
  );
}
