import { cn } from "@/lib/utils";

type Timeline2Item = {
  date: string;
  title: string;
  description: string;
};

type TimelineSectionProps = {
  items: Timeline2Item[];
  className?: string;
};

export function TimelineSection({ items, className }: TimelineSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-emerald-50/30 to-white px-6 py-8 sm:px-8 sm:py-10",
        className,
      )}
    >
      <div className="hidden md:block">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="relative pb-2">
              <div
                className={cn(
                  "absolute left-0 top-6 h-0.5 bg-emerald-300",
                  index === items.length - 1 ? "w-[88%]" : "w-full",
                )}
              />

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white shadow-[0_12px_30px_rgba(6,95,70,0.18)]">
                {index + 1}
              </div>

              <div className="mt-6 max-w-[260px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {item.date}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-emerald-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-emerald-900/75">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8 md:hidden">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="relative pl-16">
            {index !== items.length - 1 ? (
              <div className="absolute left-[19px] top-12 h-[calc(100%+1.5rem)] w-0.5 bg-emerald-300" />
            ) : null}

            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white shadow-[0_12px_30px_rgba(6,95,70,0.18)]">
              {index + 1}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {item.date}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-emerald-950">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-emerald-900/75">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
