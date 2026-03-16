"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useSession, signOut as authSignOut } from "@/lib/auth-client";
import { isDashboardRole } from "@/lib/user-roles";

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

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within <DashboardProvider>");
  }
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
  const shouldRedirectToLogin = !isPending && !session?.user;
  const shouldRedirectToHome = !isPending && !!session?.user && !isDashboardRole(role);

  useEffect(() => {
    if (shouldRedirectToLogin) {
      window.location.href = "/login";
      return;
    }

    if (shouldRedirectToHome) {
      window.location.href = "/";
    }
  }, [shouldRedirectToHome, shouldRedirectToLogin]);

  // Loading / redirecting state
  if (isPending || shouldRedirectToLogin || shouldRedirectToHome || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
    id: rawUser.id as string,
    name: (rawUser.name as string) || (rawUser.email as string),
    email: rawUser.email as string,
    image: rawUser.image as string | null | undefined,
    role: rawUser.role as string,
  };

  const handleSignOut = async () => {
    await authSignOut();
    window.location.href = "/login";
  };

  return (
    <DashboardContext value={{ user, signOut: handleSignOut }}>
      {children}
    </DashboardContext>
  );
}
