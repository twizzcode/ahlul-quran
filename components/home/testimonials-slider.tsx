"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
} from "@tabler/icons-react";
import { imageLoader } from "@/lib/imageLoader";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Testimonial } from "@/types/testimonial";

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

export default function TestimonialSlider({
  testimonials,
}: TestimonialSliderProps) {
  if (testimonials.length === 0) {
    return null;
  }

  function getSocialMeta(platform?: Testimonial["socialPlatform"]) {
    switch (platform) {
      case "instagram":
        return {
          label: "Instagram",
          icon: <IconBrandInstagram className="h-3.5 w-3.5" />,
        };
      case "tiktok":
        return {
          label: "TikTok",
          icon: <IconBrandTiktok className="h-3.5 w-3.5" />,
        };
      case "linkedin":
        return {
          label: "LinkedIn",
          icon: <IconBrandLinkedin className="h-3.5 w-3.5" />,
        };
      default:
        return null;
    }
  }

  return (
    <section className="w-full py-4">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Carousel
          className="px-1 md:px-4"
          opts={{
            loop: true,
            align: "start",
          }}
          plugins={[
            Autoplay({
              delay: 3500,
            }),
          ]}
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => {
              const socialMeta =
                testimonial.socialPlatform && testimonial.socialUrl
                  ? getSocialMeta(testimonial.socialPlatform)
                  : null;

              return (
                <CarouselItem
                  key={`${testimonial.name}-${index}`}
                  className="md:basis-1/2 xl:basis-1/3"
                >
                  <article className="rounded-[28px] border border-emerald-100/70 bg-white px-6 py-7">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="rounded-full bg-white p-3 text-emerald-700 shadow-sm">
                        <Quote className="h-5 w-5" />
                      </span>
                      {socialMeta ? (
                        <Link
                          href={testimonial.socialUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                        >
                          {socialMeta.icon}
                          <span>{socialMeta.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </div>

                    <blockquote className="text-base leading-7 text-emerald-950/80">
                      <span aria-hidden="true">&ldquo;</span>
                      {testimonial.quote}
                      <span aria-hidden="true">&rdquo;</span>
                    </blockquote>

                    <div className="mt-6 flex items-center gap-4">
                      <span className="inline-flex overflow-hidden rounded-full ring-4 ring-white/80">
                        <Image
                          loader={imageLoader}
                          className="h-12 w-12 rounded-full object-cover"
                          height={48}
                          width={48}
                          alt={testimonial.name}
                          src={testimonial.imgSrc}
                          loading="lazy"
                        />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-emerald-950">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-emerald-900/60">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-0 hidden border-emerald-200 bg-white text-emerald-900 shadow-sm hover:bg-emerald-50 md:inline-flex" />
          <CarouselNext className="right-0 hidden border-emerald-200 bg-white text-emerald-900 shadow-sm hover:bg-emerald-50 md:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
