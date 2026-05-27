import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { PublicContentSearch } from "@/components/public-content-search";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  canManageUserRoles,
  ROLE_LABELS,
  USER_ROLE_OPTIONS,
  isKnownUserRole,
} from "@/lib/user-roles";

export const dynamic = "force-dynamic";

function formatJoinedDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-rose-100 text-rose-700";
    case "TAKMIR":
      return "bg-blue-100 text-blue-700";
    case "ADMIN":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

async function getSession() {
  const headerStore = await headers();

  return auth.api.getSession({
    headers: new Headers(headerStore),
  });
}

async function updateUserRole(formData: FormData) {
  "use server";

  const session = await getSession();
  const actorRole = session?.user?.role;

  if (!canManageUserRoles(actorRole)) {
    throw new Error("Anda tidak memiliki izin untuk mengubah role pengguna.");
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const nextRole = String(formData.get("role") ?? "").trim();

  if (!userId || !isKnownUserRole(nextRole)) {
    throw new Error("Role pengguna tidak valid.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: nextRole as "SUPER_ADMIN" | "TAKMIR" | "ADMIN" | "JAMAAH",
    },
  });

  revalidatePath("/dashboard/pengguna");
  revalidatePath("/pengguna");
}

export default async function DashboardPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const session = await getSession();
  const currentUser = session?.user;
  const canEditRoles = canManageUserRoles(currentUser?.role);

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Pengguna</h1>
        <p className="text-sm text-muted-foreground">
          Kelola posisi pengguna panel admin. Hanya Super Admin dan Owner yang bisa mengubah role.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> Super Admin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Owner
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Admin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400" /> Jamaah
        </span>
      </div>

      <PublicContentSearch initialQuery={q} placeholder="Cari nama atau email pengguna..." />

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3 text-sm text-muted-foreground">
          {canEditRoles
            ? "Anda bisa mengubah posisi pengguna admin dari tabel di bawah."
            : "Akun Anda hanya bisa melihat daftar pengguna. Ubah role hanya tersedia untuk Super Admin dan Owner."}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="p-4 text-left font-medium">Nama</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Posisi</th>
                <th className="p-4 text-left font-medium">Bergabung</th>
                <th className="p-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {q ? "Pengguna tidak ditemukan untuk pencarian ini." : "Belum ada pengguna terdaftar."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        {currentUser?.id === user.id ? (
                          <p className="text-xs text-muted-foreground">Akun Anda</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatJoinedDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      {canEditRoles ? (
                        <form
                          action={updateUserRole}
                          className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end"
                        >
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            defaultValue={user.role}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {USER_ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" size="sm">
                            Simpan
                          </Button>
                        </form>
                      ) : (
                        <div className="text-right text-xs text-muted-foreground">
                          View only
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
