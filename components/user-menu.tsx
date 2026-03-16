"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isDashboardRole, ROLE_LABELS } from "@/lib/user-roles";

// ============================================================
// User Menu - Shows login button or user dropdown
// Used in the public site header
// ============================================================

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isPending) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const role = (user as Record<string, unknown>).role as string;
  const isAdmin = isDashboardRole(role);
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Buka menu akun"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border p-0.5 transition-colors hover:bg-accent"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg z-50">
          {/* User info */}
          <div className="px-3 py-2 border-b mb-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {ROLE_LABELS[role] || role}
              </span>
            )}
          </div>

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <a
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard Admin
            </a>
          )}

          {/* Logout */}
          <button
            onClick={async () => {
              await signOut();
              setOpen(false);
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
