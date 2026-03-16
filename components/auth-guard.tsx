"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { isDashboardRole } from "@/lib/user-roles";

// ============================================================
// Auth Guard - Protects dashboard routes
// Checks if user is authenticated AND has admin role
// If not → redirect to home/login
// ============================================================

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      // Not logged in → redirect to login
      window.location.href = "/login";
      return;
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (!isDashboardRole(role)) {
      // Logged in but not admin → redirect to home
      window.location.href = "/";
    }
  }, [session, isPending]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  const role = (session?.user as Record<string, unknown>)?.role as string;
  if (!session?.user || !isDashboardRole(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
