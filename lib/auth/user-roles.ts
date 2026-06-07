export const DASHBOARD_ROLES = ["DEVELOPER", "OWNER", "ADMIN"] as const;
export const USER_MANAGEMENT_EDITOR_ROLES = ["DEVELOPER", "OWNER"] as const;
export const MANAGED_ADMIN_ROLES = ["DEVELOPER", "OWNER", "ADMIN"] as const;
export const USER_ROLE_OPTIONS = ["DEVELOPER", "OWNER", "ADMIN", "JAMAAH"] as const;
export const OWNER_ASSIGNABLE_ROLES = ["ADMIN", "JAMAAH"] as const;

export const ROLE_LABELS: Record<string, string> = {
  DEVELOPER: "Developer",
  OWNER: "Owner",
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

export function isKnownUserRole(
  role: string | null | undefined,
): role is (typeof USER_ROLE_OPTIONS)[number] {
  return (
    typeof role === "string" &&
    USER_ROLE_OPTIONS.includes(role as (typeof USER_ROLE_OPTIONS)[number])
  );
}

export function getAssignableUserRoles(role: string | null | undefined) {
  if (role === "DEVELOPER") {
    return [...USER_ROLE_OPTIONS];
  }

  if (role === "OWNER") {
    return [...OWNER_ASSIGNABLE_ROLES];
  }

  return [] as string[];
}

export function canManageTargetUserRole(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
) {
  if (!isKnownUserRole(targetRole)) {
    return false;
  }

  if (actorRole === "DEVELOPER") {
    return true;
  }

  if (actorRole === "OWNER") {
    return OWNER_ASSIGNABLE_ROLES.includes(
      targetRole as (typeof OWNER_ASSIGNABLE_ROLES)[number],
    );
  }

  return false;
}

export function canAssignUserRole(
  actorRole: string | null | undefined,
  nextRole: string | null | undefined,
) {
  if (!isKnownUserRole(nextRole)) {
    return false;
  }

  return getAssignableUserRoles(actorRole).includes(nextRole);
}
