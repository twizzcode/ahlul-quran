export const DASHBOARD_ROLES = ["SUPER_ADMIN", "ADMIN", "TAKMIR"] as const;
export const USER_MANAGEMENT_EDITOR_ROLES = ["SUPER_ADMIN", "TAKMIR"] as const;
export const MANAGED_ADMIN_ROLES = ["SUPER_ADMIN", "TAKMIR", "ADMIN"] as const;
export const USER_ROLE_OPTIONS = ["SUPER_ADMIN", "TAKMIR", "ADMIN", "JAMAAH"] as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  TAKMIR: "Owner",
  ADMIN: "Admin",
  JAMAAH: "Jamaah",
};

export function isDashboardRole(role: string | null | undefined) {
  return typeof role === "string" && DASHBOARD_ROLES.includes(role as (typeof DASHBOARD_ROLES)[number]);
}

export function canManageUserRoles(role: string | null | undefined) {
  return (
    typeof role === "string" &&
    USER_MANAGEMENT_EDITOR_ROLES.includes(role as (typeof USER_MANAGEMENT_EDITOR_ROLES)[number])
  );
}

export function isManagedAdminRole(role: string | null | undefined) {
  return (
    typeof role === "string" &&
    MANAGED_ADMIN_ROLES.includes(role as (typeof MANAGED_ADMIN_ROLES)[number])
  );
}

export function isKnownUserRole(role: string | null | undefined) {
  return (
    typeof role === "string" &&
    USER_ROLE_OPTIONS.includes(role as (typeof USER_ROLE_OPTIONS)[number])
  );
}
