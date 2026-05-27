"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

type PageContentMotionProps = {
  children: ReactNode;
};

export function PageContentMotion({ children }: PageContentMotionProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        [
          "section",
          "article",
          "form",
          "header",
          "[data-reveal]",
          ".grid > *",
          ".space-y-3 > *",
          ".space-y-4 > *",
          ".space-y-5 > *",
          ".space-y-6 > *",
          ".space-y-8 > *",
        ].join(", ")
      )
    ).filter((node) => {
      if (node.dataset.motionReady === "true") {
        return false;
      }

      if (node.closest("[data-motion-skip='true']")) {
        return false;
      }

      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          element.style.opacity = "1";
          element.style.transform = "translate3d(0, 0, 0) scale(1)";
          element.style.filter = "blur(0)";
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    nodes.forEach((node, index) => {
      node.dataset.motionReady = "true";
      node.style.opacity = "0";
      node.style.transform = "translate3d(0, 26px, 0) scale(0.985)";
      node.style.filter = "blur(10px)";
      node.style.transitionProperty = "opacity, transform, filter";
      node.style.transitionDuration = "560ms";
      node.style.transitionTimingFunction = "cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.transitionDelay = `${Math.min(index % 8, 7) * 55}ms`;
      node.style.willChange = "opacity, transform, filter";
      observer.observe(node);
    });

    return () => {
      observer.disconnect();
      nodes.forEach((node) => {
        node.style.removeProperty("opacity");
        node.style.removeProperty("transform");
        node.style.removeProperty("filter");
        node.style.removeProperty("transition-property");
        node.style.removeProperty("transition-duration");
        node.style.removeProperty("transition-timing-function");
        node.style.removeProperty("transition-delay");
        node.style.removeProperty("will-change");
        delete node.dataset.motionReady;
      });
    };
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      ref={rootRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
