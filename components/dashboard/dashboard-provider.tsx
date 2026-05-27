"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useSession, signOut as authSignOut } from "@/lib/auth/auth-client";
import { isDashboardRole } from "@/lib/auth/user-roles";

// ============================================================
// Dashboard Session Provider
// Fetches session ONCE and shares across all dashboard pages.
// Handles auth verification so individual pages don't need to.
// ============================================================

type DashboardUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
};

type DashboardContextValue = {
  user: DashboardUser;
  signOut: () => Promise<void>;
};

type DashboardProviderProps = {
  children: ReactNode;
  initialUser: DashboardUser;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function getPublicOrigin() {
  const { protocol, hostname, port } = window.location;
  const publicHostname = hostname.startsWith("admin.")
    ? hostname.slice("admin.".length)
    : hostname;

  return `${protocol}//${publicHostname}${port ? `:${port}` : ""}`;
}

function getPublicLoginUrl() {
  return new URL("/login?next=/admin", getPublicOrigin()).toString();
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within <DashboardProvider>");
  }
  return ctx;
}

export function DashboardProvider({ children, initialUser }: DashboardProviderProps) {
  const { data: session, isPending } = useSession();
  const sessionUser = session?.user as Record<string, unknown> | undefined;
  const role = (sessionUser?.role as string | undefined) ?? initialUser.role;
  const shouldRedirectToLogin = !isPending && !session?.user;
  const shouldRedirectToHome = !isPending && !!session?.user && !isDashboardRole(role);

  useEffect(() => {
    if (shouldRedirectToLogin) {
      window.location.href = getPublicLoginUrl();
      return;
    }

    if (shouldRedirectToHome) {
      window.location.href = `${getPublicOrigin()}/akun`;
    }
  }, [shouldRedirectToHome, shouldRedirectToLogin]);

  // Loading / redirecting state
  if (isPending || shouldRedirectToLogin || shouldRedirectToHome || !session?.user) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.15),transparent_26%),linear-gradient(180deg,#f4fbf4_0%,#eef7f0_48%,#f7fbf6_100%)]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">
            {isPending ? "Memverifikasi akses..." : "Mengalihkan..."}
          </p>
        </div>
      </div>
    );
  }

  const rawUser = session.user as Record<string, unknown>;
  const user: DashboardUser = {
    id: (rawUser.id as string) || initialUser.id,
    name: (rawUser.name as string) || (rawUser.email as string) || initialUser.name,
    email: (rawUser.email as string) || initialUser.email,
    image: (rawUser.image as string | null | undefined) ?? initialUser.image,
    role,
  };

  const handleSignOut = async () => {
    await authSignOut();
    window.location.href = `${getPublicOrigin()}/login`;
  };

  return (
    <DashboardContext value={{ user, signOut: handleSignOut }}>
      {children}
    </DashboardContext>
  );
}
