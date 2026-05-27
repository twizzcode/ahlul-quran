import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { PublicContentSearch } from "@/components/content/public-content-search";
import { UserRoleUpdateForm } from "@/components/dashboard/users/user-role-update-form";
import { getAdminRequestContext } from "@/lib/auth/admin-session";
import {
  canAssignUserRole,
  canManageTargetUserRole,
  canManageUserRoles,
  getAssignableUserRoles,
  ROLE_LABELS,
  USER_ROLE_OPTIONS,
  isKnownUserRole,
} from "@/lib/auth/user-roles";
import { db } from "@/src";
import { user } from "@/src/db/schema";

export const dynamic = "force-dynamic";

const ADMIN_SECTION_ROLES = ["DEVELOPER", "OWNER", "ADMIN"] as const;

function formatJoinedDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "DEVELOPER":
      return "bg-rose-100 text-rose-700";
    case "OWNER":
      return "bg-blue-100 text-blue-700";
    case "ADMIN":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

async function updateUserRole(formData: FormData) {
  "use server";

  const context = await getAdminRequestContext();
  const actorId = context?.user.id;
  const actorRole = context?.user.role;

  if (!canManageUserRoles(actorRole)) {
    throw new Error("Anda tidak memiliki izin untuk mengubah role pengguna.");
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const nextRole = String(formData.get("role") ?? "").trim();

  if (!userId || !isKnownUserRole(nextRole)) {
    throw new Error("Role pengguna tidak valid.");
  }

  if (actorId === userId) {
    throw new Error("Role akun sendiri tidak bisa diubah dari halaman ini.");
  }

  const targetUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!targetUser) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  if (!canManageTargetUserRole(actorRole, targetUser.role)) {
    throw new Error("Anda tidak bisa mengubah role pengguna ini.");
  }

  if (!canAssignUserRole(actorRole, nextRole)) {
    throw new Error("Anda tidak memiliki izin untuk menetapkan role tersebut.");
  }

  await db.update(user).set({ role: nextRole as (typeof USER_ROLE_OPTIONS)[number] }).where(eq(user.id, userId));

  revalidatePath("/admin/pengguna");
}

export default async function DashboardPenggunaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const context = await getAdminRequestContext();
  const currentUser = context?.user;
  const canEditRoles = canManageUserRoles(currentUser?.role);
  const assignableRoles = getAssignableUserRoles(currentUser?.role);

  const users = await db.query.user.findMany({
    orderBy: [asc(user.role), asc(user.createdAt)],
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  void and;

  const adminUsers = users.filter((item) => ADMIN_SECTION_ROLES.includes(item.role as (typeof ADMIN_SECTION_ROLES)[number]));
  const jamaahUsers = users.filter((item) => item.role === "JAMAAH");
  const filteredJamaahUsers = q
    ? jamaahUsers.filter((item) => {
        const haystack = `${item.name} ${item.email}`.toLowerCase();
        return haystack.includes(q.toLowerCase());
      })
    : jamaahUsers;

  const stats = {
    total: users.length,
    developer: users.filter((item) => item.role === "DEVELOPER").length,
    owner: users.filter((item) => item.role === "OWNER").length,
    admin: users.filter((item) => item.role === "ADMIN").length,
    jamaah: jamaahUsers.length,
  };

  return (
    <div className="space-y-6 pt-4 md:pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Pengguna</h1>
        <p className="text-sm text-muted-foreground">
          Developer bisa mengatur semua role. Owner hanya bisa mengubah Admin dan Jamaah, sedangkan Admin bersifat view-only.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Developer</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Owner</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Admin</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> Jamaah</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Pengguna" value={stats.total.toString()} />
        <StatCard label="Developer" value={stats.developer.toString()} />
        <StatCard label="Owner" value={stats.owner.toString()} />
        <StatCard label="Admin" value={stats.admin.toString()} />
        <StatCard label="Jamaah" value={stats.jamaah.toString()} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Tim Admin</h2>
          <p className="text-sm text-muted-foreground">
            Daftar akun dengan akses dashboard: Developer, Owner, dan Admin.
          </p>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3 text-sm text-muted-foreground">
            {adminUsers.length} pengguna dengan akses dashboard
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
                {adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Belum ada pengguna dengan akses dashboard.
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          {currentUser?.id === item.id ? <p className="text-xs text-muted-foreground">Akun Anda</p> : null}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.email}</td>
                      <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(item.role)}`}>{ROLE_LABELS[item.role] || item.role}</span></td>
                      <td className="p-4 text-muted-foreground">{formatJoinedDate(item.createdAt)}</td>
                      <td className="p-4">
                        {canEditRoles && currentUser?.id !== item.id && canManageTargetUserRole(currentUser?.role, item.role) ? (
                          <UserRoleUpdateForm
                            action={updateUserRole}
                            currentRole={item.role}
                            userId={item.id}
                            roleOptions={assignableRoles}
                            roleLabels={ROLE_LABELS}
                          />
                        ) : canEditRoles && currentUser?.id === item.id ? (
                          <div className="text-right text-xs text-muted-foreground">Tidak bisa edit akun sendiri</div>
                        ) : canEditRoles ? (
                          <div className="text-right text-xs text-muted-foreground">Tidak bisa diubah oleh role Anda</div>
                        ) : (
                          <div className="text-right text-xs text-muted-foreground">View only</div>
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

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Jamaah</h2>
          <p className="text-sm text-muted-foreground">
            Pencarian di bawah ini khusus untuk pengguna dengan role Jamaah.
          </p>
        </div>

        <PublicContentSearch initialQuery={q} placeholder="Cari nama atau email jamaah..." />

        <div className="rounded-xl border">
        <div className="border-b px-4 py-3 text-sm text-muted-foreground">
          {q ? `Menampilkan hasil pencarian jamaah untuk "${q}".` : "Menampilkan seluruh pengguna dengan role Jamaah."}
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
              {filteredJamaahUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">{q ? "Jamaah tidak ditemukan untuk pencarian ini." : "Belum ada pengguna dengan role Jamaah."}</td>
                </tr>
              ) : (
                filteredJamaahUsers.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        {currentUser?.id === item.id ? <p className="text-xs text-muted-foreground">Akun Anda</p> : null}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.email}</td>
                    <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(item.role)}`}>{ROLE_LABELS[item.role] || item.role}</span></td>
                    <td className="p-4 text-muted-foreground">{formatJoinedDate(item.createdAt)}</td>
                    <td className="p-4">
                      {canEditRoles && currentUser?.id !== item.id && canManageTargetUserRole(currentUser?.role, item.role) ? (
                        <UserRoleUpdateForm
                          action={updateUserRole}
                          currentRole={item.role}
                          userId={item.id}
                          roleOptions={assignableRoles}
                          roleLabels={ROLE_LABELS}
                        />
                      ) : canEditRoles && currentUser?.id === item.id ? (
                        <div className="text-right text-xs text-muted-foreground">Tidak bisa edit akun sendiri</div>
                      ) : canEditRoles ? (
                        <div className="text-right text-xs text-muted-foreground">Tidak bisa diubah oleh role Anda</div>
                      ) : (
                        <div className="text-right text-xs text-muted-foreground">View only</div>
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
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
