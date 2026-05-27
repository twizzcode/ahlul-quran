"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/auth-client";

export function AccountSignOutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await signOut();
    window.location.href = "/";
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
