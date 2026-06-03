"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HandCoins, LayoutDashboard, LogIn, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

type AccountMenuUser = {
  name: string;
  email: string;
  image?: string | null;
};

type AccountMenuProps = {
  user: AccountMenuUser | null;
  canOpenAdmin?: boolean;
  adminUrl?: string | null;
  triggerClassName?: string;
  mobile?: boolean;
};

export function AccountMenu({
  user,
  canOpenAdmin = false,
  adminUrl,
  triggerClassName,
  mobile = false,
}: AccountMenuProps) {
  const [isPending, setIsPending] = useState(false);
  const userInitial =
    user?.name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.trim()?.[0]?.toUpperCase() ??
    "A";

  async function handleSignOut() {
    setIsPending(true);
    await signOut();
    window.location.href = "/";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {mobile ? (
          <button
            type="button"
            className={cn(
              "flex min-h-15 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium text-emerald-900/72 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-950",
              triggerClassName,
            )}
            aria-label={user ? "Buka menu akun" : "Buka menu login"}
          >
            {user ? (
              user.image ? (
                <span className="mb-1 overflow-hidden rounded-full">
                  <Image
                    src={user.image}
                    alt={user.name || "Akun"}
                    width={16}
                    height={16}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                </span>
              ) : (
                <span className="mb-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-semibold text-emerald-900">
                  {userInitial}
                </span>
              )
            ) : (
              <UserRound className="mb-1 h-4 w-4" />
            )}
            <span>{user ? "Akun" : "Masuk"}</span>
          </button>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "rounded-full shadow-none transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-950",
              user ? "h-10 w-10 overflow-hidden p-0" : "h-10 w-10 p-0 text-emerald-900/85",
              triggerClassName,
            )}
          >
            {user ? (
              user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Akun"}
                  width={40}
                  height={40}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900">
                  {userInitial}
                </span>
              )
            ) : (
              <LogIn className="h-4 w-4" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={mobile ? "center" : "end"}
        sideOffset={mobile ? 14 : 10}
        className="z-[240] min-w-[240px] rounded-2xl border-emerald-100 p-2"
      >
        {user ? (
          <>
            <DropdownMenuLabel className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-emerald-950">{user.name}</p>
              <p className="truncate text-xs font-normal text-emerald-900/65">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-emerald-100" />
            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-emerald-950">
              <Link href="/riwayat-donasi">
                <HandCoins className="h-4 w-4" />
                Riwayat Donasi
              </Link>
            </DropdownMenuItem>
            {canOpenAdmin && adminUrl ? (
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-emerald-950">
                <Link href={adminUrl}>
                  <LayoutDashboard className="h-4 w-4" />
                  Masuk Admin
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleSignOut();
              }}
              disabled={isPending}
              className="rounded-xl px-3 py-2.5 text-emerald-950"
            >
              <LogOut className="h-4 w-4" />
              {isPending ? "Keluar..." : "Keluar"}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-emerald-950">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
