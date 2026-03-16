"use client";

import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { formatCurrency } from "@/lib/utils";

export type DonorHighlightItem = {
  id: number;
  name: string;
  donationCount: number;
  totalAmount: number;
};

type AnimatedTooltipPreviewProps = {
  items: DonorHighlightItem[];
};

const avatarPalette = [
  { background: "#115e59", foreground: "#ecfeff" },
  { background: "#14532d", foreground: "#f0fdf4" },
  { background: "#1d4ed8", foreground: "#eff6ff" },
  { background: "#7c2d12", foreground: "#fff7ed" },
  { background: "#6b21a8", foreground: "#faf5ff" },
  { background: "#9a3412", foreground: "#fff7ed" },
];

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "HA"
  );
}

function buildAvatarDataUri(name: string, index: number) {
  const palette = avatarPalette[index % avatarPalette.length];
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="${palette.background}" />
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${palette.foreground}">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function AnimatedTooltipPreview({
  items,
}: AnimatedTooltipPreviewProps) {
  if (items.length === 0) {
    return null;
  }

  const tooltipItems = items.map((item, index) => ({
    id: item.id,
    name: item.name,
    designation: `${formatCurrency(item.totalAmount)} • ${item.donationCount} donasi`,
    image: buildAvatarDataUri(item.name, index),
  }));

  return (
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Donatur Penggerak
        </p>
        <h2 className="mt-3 text-2xl font-bold text-emerald-950 sm:text-3xl">
          Nama terbesar mengikuti total donasi yang sudah masuk
        </h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/70 sm:text-base">
          Semakin besar kontribusinya, semakin menonjol tampilannya. Arahkan kursor ke
          avatar untuk melihat total donasi dan jumlah transaksinya.
        </p>
      </div>

      <div className="mb-8 mt-8 flex flex-row items-center justify-center">
        <AnimatedTooltip items={tooltipItems} />
      </div>
    </div>
  );
}
