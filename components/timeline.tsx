import { Building2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type TimelineItemView = {
  period: string;
  title: string;
  description: string;
};

type TimelineProps = {
  items: TimelineItemView[];
};

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="mx-auto max-w-(--breakpoint-sm) px-6 py-12 md:py-20">
      <div className="relative ml-3">
        <div className="absolute top-4 bottom-0 left-0 border-l-2 border-emerald-200" />

        {items.map(({ description, period, title }, index) => (
            <div className="relative pb-12 pl-8 last:pb-0" key={index}>
              <div className="absolute top-3 left-px h-3 w-3 -translate-x-1/2 rounded-full border-2 border-emerald-700 bg-white ring-8 ring-[#f6f8f6]" />

              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <Building2 className="h-5 w-5 text-emerald-700" />
                  </div>
                  <span className="text-base font-medium text-emerald-900">
                    Tahap {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-xl tracking-[-0.01em] text-emerald-950">
                    {title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700">
                    <Calendar className="h-4 w-4" />
                    <span>{period}</span>
                  </div>
                </div>
                <p className="text-pretty text-sm text-emerald-900/70 sm:text-base">
                  {description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-50" variant="secondary">
                    Pembangunan
                  </Badge>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
