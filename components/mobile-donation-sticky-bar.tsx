"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

type MobileDonationStickyBarProps = {
  slug: string;
};

export function MobileDonationStickyBar({
  slug,
}: MobileDonationStickyBarProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[120] lg:hidden">
      <div className="border-t border-emerald-100 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-4 backdrop-blur">
        <Button
          size="lg"
          className="h-14 w-full rounded-[20px] bg-emerald-900 px-6 text-base font-semibold hover:bg-emerald-800"
          asChild
        >
          <Link href={`/donasi/${slug}/bayar`}>Donasi Sekarang</Link>
        </Button>
      </div>
    </div>,
    document.body
  );
}
