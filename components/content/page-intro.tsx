import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  title: string;
  description: string;
  className?: string;
  badge?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export function PageIntro({
  title,
  description,
  className,
  badge = "Gerakan Semilyar Tangan",
  primaryAction,
  secondaryAction,
}: PageIntroProps) {
  const extendedDescription = `${description.trim().replace(/\s+/g, " ")} ${
    "Temukan ringkasan informasi, arah gerak, dan update penting yang relevan untuk jamaah, donatur, dan masyarakat."
  }`;

  return (
    <section
      className={cn(
        "relative left-1/2 right-1/2 -mt-4 mb-8 w-screen -translate-x-1/2 overflow-hidden bg-[linear-gradient(180deg,#064e3b_0%,#065f46_100%)] px-4 py-9 sm:mb-10 sm:px-6 sm:py-16",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%)]" />
      <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-5 hidden sm:block">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-50/90 backdrop-blur-sm">
              {badge}
            </span>
          </div>
          <h1 className="text-[2rem] font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-4xl text-sm leading-7 text-emerald-50/80 sm:mt-5 sm:text-lg sm:leading-8">
            {extendedDescription}
          </p>
          {primaryAction || secondaryAction ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:mt-7">
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className="group inline-flex items-center gap-2 border-b border-white/35 pb-0.5 text-sm font-semibold text-white transition-colors hover:border-white hover:text-emerald-100"
                >
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="group inline-flex items-center gap-2 border-b border-white/20 pb-0.5 text-sm font-semibold text-emerald-50/90 transition-colors hover:border-white/70 hover:text-white"
                >
                  {secondaryAction.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
