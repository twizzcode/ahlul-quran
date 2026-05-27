import Link from "next/link";
import type { ReactNode } from "react";
import type { MasjidProfileData } from "@/lib/masjid/masjid-profile";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

type SiteFooterProps = {
  profile: MasjidProfileData;
};

export function SiteFooter({ profile }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const location = [profile.city, profile.province].filter(Boolean).join(", ");
  const primaryDonationBank =
    profile.donationBankAccounts.find(
      (item) => item.isActive && item.bankName && item.bankAccount,
    ) ?? null;
  const donationInfo = primaryDonationBank
    ? `${primaryDonationBank.bankName} • ${primaryDonationBank.bankAccount}${
        primaryDonationBank.bankHolder ? ` • ${primaryDonationBank.bankHolder}` : ""
      }`
    : profile.bankName && profile.bankAccount
      ? `${profile.bankName} • ${profile.bankAccount}${
          profile.bankHolder ? ` • ${profile.bankHolder}` : ""
        }`
      : "";

  const contactLinks: FooterLink[] = [
    ...(profile.phone ? [{ label: profile.phone, href: `tel:${profile.phone}` }] : []),
    ...(profile.email ? [{ label: profile.email, href: `mailto:${profile.email}` }] : []),
    ...(location ? [{ label: location, href: "/profil" }] : []),
    ...(donationInfo ? [{ label: donationInfo, href: "/donasi" }] : []),
  ];

  const footerSections: FooterSection[] = [
    {
      title: "Profil",
      links: [
        { label: "Profil Markas Dakwah", href: "/profil" },
        { label: "Visi Utama", href: "/profil#visi-utama" },
        { label: "Struktur Panitia", href: "/profil#struktur-panitia" },
      ],
    },
    {
      title: "Program",
      links: [
        { label: "Donasi", href: "/donasi" },
        { label: "Program", href: "/kegiatan" },
        { label: "Berita", href: "/berita" },
        { label: "Artikel", href: "/artikel" },
        { label: "Galeri", href: "/galeri" },
      ],
    },
    {
      title: "Kontak",
      links: contactLinks,
    },
  ].filter((section) => section.links.length > 0);

  const socialLinks = [
    { label: "Facebook", href: profile.facebook, icon: FacebookIcon },
    { label: "Instagram", href: profile.instagram, icon: InstagramIcon },
    { label: "YouTube", href: profile.youtube, icon: YoutubeIcon },
    { label: "TikTok", href: profile.tiktok, icon: TiktokIcon },
    { label: "Website", href: profile.website, icon: GlobeIcon },
  ].filter((item) => item.href);

  return (
    <div className="bg-emerald-900 px-4 pt-20">
      <footer className="mx-auto w-full max-w-7xl overflow-hidden rounded-tl-3xl rounded-tr-3xl bg-white px-4 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-8 text-black sm:px-6 lg:px-8 lg:pb-0 lg:pt-12">
        <div className="grid w-full grid-cols-1 gap-8 md:gap-12 lg:grid-cols-6">
          <div className="space-y-6 lg:col-span-3">
            <Link href="/" aria-label="Back to homepage" className="inline-block">
              <Image
                src={profile.logoUrl || "/logo.webp"}
                alt={`${profile.name} logo`}
                width={40}
                height={40}
                className="h-15 w-15 object-contain"
              />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {profile.foundationName}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-neutral-900 sm:text-3xl">
                {profile.name}
              </h2>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
                {profile.movementName}
              </p>
            </div>

            <p className="max-w-96 text-sm/6 text-neutral-600">
              {profile.description}
            </p>

            {socialLinks.length > 0 ? (
              <TooltipProvider>
                <div className="flex gap-5 md:gap-6">
                  {socialLinks.map((social) => (
                    <Tooltip key={social.label}>
                      <TooltipTrigger asChild>
                        <Link
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label}
                          className="text-neutral-600 transition-colors hover:text-neutral-800"
                        >
                          <social.icon />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={8}>
                        {social.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            ) : null}
          </div>

          <div className="grid grid-cols-2 items-start gap-8 md:grid-cols-3 md:gap-12 lg:col-span-3 lg:gap-28">
            {footerSections.map((section) => (
              <div
                key={section.title}
                className={
                  section.title === "Kontak" ? "col-span-2 md:col-span-1" : ""
                }
              >
                <h3 className="mb-4 text-sm font-medium">{section.title}</h3>
                <ul className="space-y-3 text-sm text-neutral-800">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors hover:text-neutral-700"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="transition-colors hover:text-neutral-700"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex w-full flex-col gap-2 border-t border-neutral-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-600">
            © {year} {profile.name}
          </p>
          <p className="text-sm text-neutral-600">{profile.movementName}</p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-full max-h-64 w-full max-w-3xl rounded-full bg-slate-100 blur-[100px]" />
          <h2 className="mt-6 whitespace-nowrap text-center text-[clamp(2.35rem,10vw,11rem)] font-extrabold leading-[0.8] text-transparent [-webkit-text-stroke:1px_#D4D4D4]">
            Ahlul Qur&apos;an
          </h2>
        </div>
      </footer>
    </div>
  );
}

function FooterIconWrapper({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center">
      {children}
    </span>
  );
}

function FacebookIcon() {
  return (
    <FooterIconWrapper>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6H17V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4V11H7.5v3h2.8v8h3.2Z" />
      </svg>
    </FooterIconWrapper>
  );
}

function InstagramIcon() {
  return (
    <FooterIconWrapper>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </FooterIconWrapper>
  );
}

function YoutubeIcon() {
  return (
    <FooterIconWrapper>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.8 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    </FooterIconWrapper>
  );
}

function TiktokIcon() {
  return (
    <FooterIconWrapper>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.6 3c.5 2.1 1.8 3.7 3.9 4.2v3.2c-1.4 0-2.8-.4-3.9-1.2v5.6A5.8 5.8 0 1 1 10.8 9v3.3a2.6 2.6 0 1 0 2.4 2.6V3h3.4Z" />
      </svg>
    </FooterIconWrapper>
  );
}

function GlobeIcon() {
  return (
    <FooterIconWrapper>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
      </svg>
    </FooterIconWrapper>
  );
}
